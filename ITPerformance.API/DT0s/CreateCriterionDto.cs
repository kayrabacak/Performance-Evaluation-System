using System.ComponentModel.DataAnnotations;

namespace ITPerformance.API.DTOs
{
    public class CreateCriterionDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        // Eğer bu bir alt kriterse, bu alana ana kriterin ID'si yazılır.Eğer bir ana başlıksa, bu alan boş (null) bırakılır. !!! sadece alt kriter doldurulur. o yuzden int'in yanında ? bulunuyor.
        public int? ParentCriterionID { get; set; }

        [Range(1, 100)]
        public decimal? Weight { get; set; }

        public string? AnalystDescription { get; set; }
        public string? DeveloperDescription { get; set; }
        public string? QADescription { get; set; }

    }
}

   
