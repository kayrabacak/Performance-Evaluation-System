using System.ComponentModel.DataAnnotations;


namespace ITPerformance.API.DTOs
{

 public class UpdateCriterionDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public int? ParentCriterionID { get; set; }

    [Range(1, 100)]
    public decimal? Weight { get; set; }

    public string? AnalystDescription { get; set; }
    public string? DeveloperDescription { get; set; }
    public string? QADescription { get; set; }
}
}