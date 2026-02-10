using ITPerformance.API.DataAccess;
using ITPerformance.API.DTOs;
using ITPerformance.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ITPerformance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EvaluationsController : ControllerBase
    {
        private readonly PerformanceDbContext _context;

        public EvaluationsController(PerformanceDbContext context)
        {
            _context = context;
        }

        [HttpGet("form-data")]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<IActionResult> GetEvaluationFormData()
        {
            var evaluatorIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(evaluatorIdString))
            {
                return Unauthorized("Token içinde kullanıcı ID'si bulunamadı.");
            }
            var evaluatorId = int.Parse(evaluatorIdString);
            var evaluator = await _context.Users.FindAsync(evaluatorId);
            if (evaluator == null)
            {
                return Unauthorized();
            }

            var teamMembers = await _context.Users
                .Where(u => u.DepartmentID == evaluator.DepartmentID && u.Role.RoleName == "Employee" && u.IsActive)
                .Select(u => new { u.UserID, FullName = u.FirstName + " " + u.LastName })
                .ToListAsync();

            var criteria = await _context.Criteria
                .Where(c => c.IsActive && c.ParentCriterionID == null)
                .Include(c => c.SubCriteria.Where(sub => sub.IsActive))
                .Select(c => new CriterionDto
                {
                    CriterionID = c.CriterionID,
                    Title = c.Title,
                    Weight = c.Weight,
                    IsActive = c.IsActive,
                    ParentCriterionID = c.ParentCriterionID,
                    SubCriteria = c.SubCriteria.Select(sub => new CriterionDto
                    {
                        CriterionID = sub.CriterionID,
                        Title = sub.Title,
                        Weight = sub.Weight,
                        AnalystDescription = sub.AnalystDescription,
                        DeveloperDescription = sub.DeveloperDescription,
                        QADescription = sub.QADescription,
                        IsActive = sub.IsActive,
                        ParentCriterionID = sub.ParentCriterionID
                    }).ToList()
                })
                .ToListAsync();

            // GÜNCELLEME: Frontend'e yardımcı olmak için tamamlanmış değerlendirmeleri gönderiyoruz
            var completedEvaluations = await _context.Evaluations
                .Where(e => e.EvaluatorID == evaluatorId)
                .Select(e => new { EmployeeID = e.EmployeeID, e.Period })
                .ToListAsync();

            return Ok(new { teamMembers, criteria, completedEvaluations });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<IActionResult> SubmitEvaluation(SubmitEvaluationDto submission)
        {
            var evaluatorIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(evaluatorIdString))
            {
                return Unauthorized("Token içinde kullanıcı ID'si bulunamadı.");
            }
            var evaluatorId = int.Parse(evaluatorIdString);

            // bu değerlendirme daha önce yapılmış mı kontrolu
            bool alreadyExists = await _context.Evaluations
                .AnyAsync(e => 
                    e.EvaluatorID == evaluatorId &&
                    e.EmployeeID == submission.EmployeeId &&
                    e.Period == submission.Period);

            if (alreadyExists)
            {
                return BadRequest(new { message = "Bu çalışan bu dönem için tarafınızca zaten değerlendirilmiş." });
            }

            // agirlik kontrolu 
            var activeMainCriteria = await _context.Criteria
                .Where(c => c.IsActive && c.ParentCriterionID == null)
                .Include(c => c.SubCriteria.Where(sub => sub.IsActive))
                .ToListAsync();

            var mainCriteriaTotalWeight = activeMainCriteria.Sum(c => c.Weight ?? 0);
            if (mainCriteriaTotalWeight != 100)
            {
                return BadRequest(new { message = $"Değerlendirme gönderilemedi: Aktif ana kriterlerin toplam ağırlığı %{mainCriteriaTotalWeight}, %100 olmalı." });
            }

            foreach (var category in activeMainCriteria)
            {
                if (category.SubCriteria.Any())
                {
                    var subCriteriaTotalWeight = category.SubCriteria.Sum(sub => sub.Weight ?? 0);
                    if (subCriteriaTotalWeight != 100)
                    {
                        return BadRequest(new { message = $"Değerlendirme gönderilemedi: '{category.Title}' başlığının aktif alt kriterlerinin toplam ağırlığı %{subCriteriaTotalWeight}, %100 olmalı." });
                    }
                }
            }
            
            // agirlik hesaplama

            var submittedCriterionIds = submission.Scores.Select(s => s.CriterionId).ToList();
            var criteriaForEvaluation = await _context.Criteria
                .Where(c => submittedCriterionIds.Contains(c.CriterionID))
                .AsNoTracking()
                .ToDictionaryAsync(c => c.CriterionID);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var evaluation = new Evaluation
                {
                    EmployeeID = submission.EmployeeId,
                    EvaluatorID = evaluatorId,
                    Period = submission.Period,
                    Comments = submission.Comments,
                    EvaluationDate = DateTime.UtcNow
                };
                _context.Evaluations.Add(evaluation);
                await _context.SaveChangesAsync();

                foreach (var scoreDto in submission.Scores)
                {
                    if (!criteriaForEvaluation.TryGetValue(scoreDto.CriterionId, out var criterion) || !criterion.Weight.HasValue)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Puanlanan kriter (ID: {scoreDto.CriterionId}) bulunamadı veya ağırlığı tanımsız.");
                    }

                    var evaluationScore = new EvaluationScore
                    {
                        EvaluationID = evaluation.EvaluationID,
                        CriterionID = scoreDto.CriterionId,
                        Score = scoreDto.Score,
                        HistoricalWeight = criterion.Weight.Value
                    };
                    _context.EvaluationScores.Add(evaluationScore);
                }
                await _context.SaveChangesAsync();
                
                var allCriteria = await _context.Criteria.AsNoTracking().ToListAsync();
                var mainCriteriaFromDb = allCriteria.Where(c => c.ParentCriterionID == null && c.IsActive).ToList();
                var subCriteriaFromDb = allCriteria.Where(c => c.ParentCriterionID != null && c.IsActive).ToList();
                
                decimal totalOverallScore = 0;

                foreach (var category in mainCriteriaFromDb)
                {
                    var subCriteriaOfCategory = subCriteriaFromDb.Where(sc => sc.ParentCriterionID == category.CriterionID);
                    if (!subCriteriaOfCategory.Any()) continue;
                    
                    decimal categoryScore = 0;
                    foreach (var sub in subCriteriaOfCategory)
                    {
                        var userScore = submission.Scores.FirstOrDefault(s => s.CriterionId == sub.CriterionID);
                        if (userScore != null && sub.Weight.HasValue)
                        {
                            categoryScore += userScore.Score * (sub.Weight.Value / 100m);
                        }
                    }
                    
                    if (category.Weight.HasValue)
                    {
                        totalOverallScore += categoryScore * (category.Weight.Value / 100m);
                    }
                }

                evaluation.OverallScore = totalOverallScore;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { message = "Değerlendirme başarıyla kaydedildi.", overallScore = evaluation.OverallScore });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Hata: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Değerlendirme kaydedilirken sunucuda bir hata oluştu." });
            }
        }

        [HttpGet("my-evaluations")]
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<IEnumerable<EvaluationResultDto>>> GetMyEvaluations()
        {
            var employeeIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(employeeIdString)) return Unauthorized("Token içinde kullanıcı ID'si bulunamadı.");
            var employeeId = int.Parse(employeeIdString);

            var evaluations = await _context.Evaluations
                .Where(e => e.EmployeeID == employeeId)
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criterion)
                .Select(e => new EvaluationResultDto
                {
                    EvaluationID = e.EvaluationID,
                    Period = e.Period,
                    EvaluationDate = e.EvaluationDate,
                    OverallScore = e.OverallScore,
                    Comments = e.Comments,
                    EvaluatorFullName = e.Evaluator.FirstName + " " + e.Evaluator.LastName,
                    Scores = e.EvaluationScores.Select(es => new ScoreResultDto
                    {
                        CriterionTitle = es.Criterion.Title,
                        Score = es.Score,
                        Weight = es.HistoricalWeight
                    }).ToList()
                })
                .OrderByDescending(e => e.EvaluationDate)
                .ToListAsync();

            return Ok(evaluations);
        }

        [HttpGet("team-evaluations")]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<ActionResult<IEnumerable<EvaluationResultDto>>> GetTeamEvaluations([FromQuery] string? period)
        {
            var evaluatorIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(evaluatorIdString)) return Unauthorized("Token içinde kullanıcı ID'si bulunamadı.");
            var evaluatorId = int.Parse(evaluatorIdString);
            var evaluator = await _context.Users.FindAsync(evaluatorId);
            if (evaluator == null) return Unauthorized();

            var evaluationsQuery = _context.Evaluations
                .Where(e => e.Employee.DepartmentID == evaluator.DepartmentID);

            if (!string.IsNullOrEmpty(period))
            {
                evaluationsQuery = evaluationsQuery.Where(e => e.Period == period);
            }

            var evaluations = await evaluationsQuery
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criterion)
                .Select(e => new EvaluationResultDto
                {
                    EvaluationID = e.EvaluationID,
                    Period = e.Period,
                    EvaluationDate = e.EvaluationDate,
                    OverallScore = e.OverallScore,
                    Comments = e.Comments,
                    EmployeeFullName = e.Employee.FirstName + " " + e.Employee.LastName,
                    EvaluatorFullName = e.Evaluator.FirstName + " " + e.Evaluator.LastName,
                    Scores = e.EvaluationScores.Select(es => new ScoreResultDto
                    {
                        CriterionTitle = es.Criterion.Title,
                        Score = es.Score,
                        Weight = es.HistoricalWeight
                    }).ToList()
                })
                .OrderByDescending(e => e.EvaluationDate)
                .ToListAsync();

            return Ok(evaluations);
        }

        // GÜNCELLEME: Bu metoda da dönem filtresi eklendi.
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<EvaluationResultDto>>> GetAllEvaluations([FromQuery] int? departmentId, [FromQuery] string? period)
        {
            var evaluationsQuery = _context.Evaluations.AsQueryable();
            
            if (departmentId.HasValue)
            {
                evaluationsQuery = evaluationsQuery.Where(e => e.Employee.DepartmentID == departmentId.Value);
            }

            // Eğer bir dönem parametresi gönderildiyse, sorguya bu filtreyi ekliyoruz.
            if (!string.IsNullOrEmpty(period))
            {
                evaluationsQuery = evaluationsQuery.Where(e => e.Period == period);
            }

            var evaluations = await evaluationsQuery
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criterion)
                .Select(e => new EvaluationResultDto
                {
                    EvaluationID = e.EvaluationID,
                    Period = e.Period,
                    EvaluationDate = e.EvaluationDate,
                    OverallScore = e.OverallScore,
                    Comments = e.Comments,
                    EmployeeFullName = e.Employee.FirstName + " " + e.Employee.LastName,
                    EvaluatorFullName = e.Evaluator.FirstName + " " + e.Evaluator.LastName,
                    Scores = e.EvaluationScores.Select(es => new ScoreResultDto
                    {
                        CriterionTitle = es.Criterion.Title,
                        Score = es.Score,
                        Weight = es.HistoricalWeight
                    }).ToList()
                })
                .OrderByDescending(e => e.EvaluationDate)
                .ToListAsync();

            return Ok(evaluations);
        }
    }
}