using System.ComponentModel.DataAnnotations;

namespace ITPerformance.API.DTOs
{
    // Bu DTO, bir değerlendirmedeki tek bir kritere verilen puanı temsil eder.
    public class ScoreDto
    {
        public int CriterionId { get; set; }

        // Veri tipini 'byte' olarak tutuyoruz, veritabanındaki 'TINYINT' ile uyumlu.
        [Range(1, 5)]
        public byte Score { get; set; }
        public decimal? Weight { get; set; } 
    }
}
