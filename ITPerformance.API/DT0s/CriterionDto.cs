using System.ComponentModel.DataAnnotations;

namespace ITPerformance.API.DTOs
{
    public class CriterionDto
    {


        public int CriterionID { get; set; }
        public string Title { get; set; } = string.Empty;
        public int? ParentCriterionID { get; set; }
        public decimal? Weight { get; set; }
        public string? AnalystDescription { get; set; }
        public string? DeveloperDescription { get; set; }
        public string? QADescription { get; set; }
        public bool IsActive { get; set; }

        public List<CriterionDto> SubCriteria { get; set; } = new List<CriterionDto>();

       
    }
}
