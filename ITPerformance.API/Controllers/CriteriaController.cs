using ITPerformance.API.DataAccess;
using ITPerformance.API.DTOs;
using ITPerformance.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ITPerformance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class CriteriaController : ControllerBase
    {
        private readonly PerformanceDbContext _context;

        public CriteriaController(PerformanceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Criterion>>> GetCriteria()
        {
            var allCriteria = await _context.Criteria
                .AsNoTracking()
                .ToListAsync();
            return Ok(allCriteria);
        }

        [HttpPost]
        public async Task<ActionResult<Criterion>> CreateCriterion(CreateCriterionDto createCriterionDto)
        {
            if (!createCriterionDto.Weight.HasValue)
            {
                return BadRequest(new { message = "Ağırlık değeri boş olamaz." });
            }

            if (createCriterionDto.ParentCriterionID.HasValue)
            {
                var siblingsWeight = await _context.Criteria
                    // GÜNCELLEME: Sadece AKTİF olan kardeşlerin ağırlıklarını topla
                    .Where(c => c.ParentCriterionID == createCriterionDto.ParentCriterionID.Value && c.IsActive)
                    .SumAsync(c => c.Weight ?? 0);

                if (siblingsWeight + createCriterionDto.Weight.Value > 100)
                {
                    return BadRequest(new { message = $"Aktif alt kriterlerin toplam ağırlığı (%{siblingsWeight + createCriterionDto.Weight.Value}) %100'ü aşamaz." });
                }
            }
            else
            {
                var mainCriteriaWeight = await _context.Criteria
                    // GÜNCELLEME: sadece aktif olan kriterler
                    .Where(c => c.ParentCriterionID == null && c.IsActive)
                    .SumAsync(c => c.Weight ?? 0);

                if (mainCriteriaWeight + createCriterionDto.Weight.Value > 100)
                {
                    return BadRequest(new { message = $"Aktif ana kriterlerin toplam ağırlığı (%{mainCriteriaWeight + createCriterionDto.Weight.Value}) %100'ü aşamaz." });
                }
            }

            var criterion = new Criterion
            {
                Title = createCriterionDto.Title,
                ParentCriterionID = createCriterionDto.ParentCriterionID,
                Weight = createCriterionDto.Weight,
                AnalystDescription = createCriterionDto.AnalystDescription,
                DeveloperDescription = createCriterionDto.DeveloperDescription,
                QADescription = createCriterionDto.QADescription,
                IsActive = true
            };

            _context.Criteria.Add(criterion);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCriteria), new { id = criterion.CriterionID }, criterion);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCriterion(int id, UpdateCriterionDto updateCriterionDto)
        {
            var criterionToUpdate = await _context.Criteria.FindAsync(id);
            if (criterionToUpdate == null)
            {
                return NotFound(new { message = "Güncellenecek kriter bulunamadı." });
            }

            if (!updateCriterionDto.Weight.HasValue)
            {
                 return BadRequest(new { message = "Ağırlık değeri boş olamaz." });
            }

            if (criterionToUpdate.ParentCriterionID.HasValue)
            {
                var siblingsWeight = await _context.Criteria
                    // sadece aktif kriterler
                    .Where(c => c.ParentCriterionID == criterionToUpdate.ParentCriterionID.Value && c.CriterionID != id && c.IsActive)
                    .SumAsync(c => c.Weight ?? 0);

                if (siblingsWeight + updateCriterionDto.Weight.Value > 100)
                {
                    return BadRequest(new { message = $"Güncelleme ile aktif alt kriterlerin toplam ağırlığı (%{siblingsWeight + updateCriterionDto.Weight.Value}) %100'ü aşamaz." });
                }
            }
            else
            {
                var mainCriteriaWeight = await _context.Criteria
                    // sadece aktif kriterler
                    .Where(c => c.ParentCriterionID == null && c.CriterionID != id && c.IsActive)
                    .SumAsync(c => c.Weight ?? 0);

                if (mainCriteriaWeight + updateCriterionDto.Weight.Value > 100)
                {
                    return BadRequest(new { message = $"Güncelleme ile aktif ana kriterlerin toplam ağırlığı (%{mainCriteriaWeight + updateCriterionDto.Weight.Value}) %100'ü aşamaz." });
                }
            }

            criterionToUpdate.Title = updateCriterionDto.Title;
            criterionToUpdate.Weight = updateCriterionDto.Weight;
            criterionToUpdate.AnalystDescription = updateCriterionDto.AnalystDescription;
            criterionToUpdate.DeveloperDescription = updateCriterionDto.DeveloperDescription;
            criterionToUpdate.QADescription = updateCriterionDto.QADescription;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ToggleCriterionStatus(int id)
        {
            var criterion = await _context.Criteria.FindAsync(id);
            if (criterion == null)
            {
                return NotFound("Kriter bulunamadı.");
            }
            criterion.IsActive = !criterion.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool CriterionExists(int id)
        {
            return _context.Criteria.Any(e => e.CriterionID == id);
        }
    }
}