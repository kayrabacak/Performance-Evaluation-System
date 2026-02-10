using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITPerformance.API.Entities
{
    [Table("Criteria")]
    public class Criterion 
    {
        [Key]
        public int CriterionID { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public int? ParentCriterionID { get; set; }

        [ForeignKey("ParentCriterionID")]
        public virtual Criterion? ParentCriterion { get; set; }

        public virtual ICollection<Criterion> SubCriteria { get; set; } = new List<Criterion>();
        

        [Column(TypeName = "decimal(5, 2)")]
        public decimal? Weight { get; set; }

        public string? AnalystDescription { get; set; }
        public string? DeveloperDescription { get; set; }
        public string? QADescription { get; set; }

        public bool IsActive { get; set; } = true;

        public virtual ICollection<EvaluationScore> EvaluationScores { get; set; } = new List<EvaluationScore>();
    }
}
