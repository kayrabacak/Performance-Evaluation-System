using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITPerformance.API.Entities
{
    [Table("Evaluations")]
    public class Evaluation
    {
        [Key]
        public int EvaluationID { get; set; }

        public int EmployeeID { get; set; }
        public int EvaluatorID { get; set; }
        public DateTime EvaluationDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Period { get; set; } = string.Empty;

        [Column(TypeName = "decimal(5, 2)")]
        public decimal? OverallScore { get; set; }
        public string? Comments { get; set; }


        [ForeignKey("EmployeeID")]
        [InverseProperty("EvaluationsAsEmployee")]
        //employeeıd ile değerlendirilenin employee baglantisi
        public virtual User Employee { get; set; } = null!;

        [ForeignKey("EvaluatorID")]
        [InverseProperty("EvaluationsAsEvaluator")]
        // evaluatorid ile değerlendirenin evaluator baglantisi
        public virtual User Evaluator { get; set; } = null!;

        public virtual ICollection<EvaluationScore> EvaluationScores { get; set; } = new List<EvaluationScore>();
    }
}
