using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITPerformance.API.Entities
{
    [Table("EvaluationScores")]
    public class EvaluationScore
    {
        [Key]
        public int EvaluationScoreID { get; set; }

        public int EvaluationID { get; set; }
        public int CriterionID { get; set; }

        // --- DÜZELTME BURADA: Veri tipini 'int' yerine 'byte' yapıyoruz ---
        // Bu, veritabanındaki 'TINYINT' ile tam olarak eşleşir.
        [Range(1, 5)]
        public byte Score { get; set; }
         public decimal HistoricalWeight { get; set; } 

        // Navigation Properties
        [ForeignKey("EvaluationID")]
        public virtual Evaluation Evaluation { get; set; } = null!;

        [ForeignKey("CriterionID")]
        public virtual Criterion Criterion { get; set; } = null!;
    }
}
