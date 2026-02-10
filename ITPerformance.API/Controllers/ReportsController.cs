using ITPerformance.API.DataAccess;
using ITPerformance.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ITPerformance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly PerformanceDbContext _context;

        public ReportsController(PerformanceDbContext context)
        {
            _context = context;
        }

        // --- GÜNCELLEME: Metod artık ortalama yerine dönemlik sıralama yapıyor ---
        [HttpGet("ranking")]
        [Authorize(Roles = "Admin,Evaluator")]
        // Metod imzası artık zorunlu 'period' ve isteğe bağlı 'departmentId' alıyor.
        public async Task<ActionResult<IEnumerable<RankingDto>>> GetRanking([FromQuery] string period, [FromQuery] int? departmentId)
        {
            // Frontend'den bir dönem gönderilmesi zorunlu hale getirildi.
            if (string.IsNullOrEmpty(period))
            {
                return BadRequest(new { message = "Lütfen sıralama için bir dönem seçin." });
            }

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (string.IsNullOrEmpty(userIdString) || string.IsNullOrEmpty(userRole))
            {
                return Unauthorized("Token içinde gerekli kullanıcı bilgileri bulunamadı.");
            }
            var userId = int.Parse(userIdString);

            // Sorgu artık direkt Değerlendirmeler (Evaluations) tablosundan başlıyor.
            var evaluationsQuery = _context.Evaluations
                .Include(e => e.Employee)
                    .ThenInclude(emp => emp.Department)
                .Where(e => e.Period == period && e.OverallScore.HasValue && e.Employee.IsActive);

            // Rol bazlı departman filtresi (bu mantık korunuyor)
            if (userRole == "Evaluator")
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return Unauthorized();
                evaluationsQuery = evaluationsQuery.Where(e => e.Employee.DepartmentID == user.DepartmentID);
            }
            else if (userRole == "Admin" && departmentId.HasValue)
            {
                evaluationsQuery = evaluationsQuery.Where(e => e.Employee.DepartmentID == departmentId.Value);
            }

            // Sonuçları RankingDto'ya dönüştür ve skora göre sırala
            var ranking = await evaluationsQuery
                .Select(e => new RankingDto
                {
                    UserId = e.Employee.UserID,
                    FullName = e.Employee.FirstName + " " + e.Employee.LastName,
                    DepartmentName = e.Employee.Department.DepartmentName,
                    // Artık AverageScore değil, o döneme ait tekil skor
                    Score = e.OverallScore.Value,
                    Period = e.Period
                })
                .OrderByDescending(r => r.Score)
                .ToListAsync();

            return Ok(ranking);
        }
    }
}