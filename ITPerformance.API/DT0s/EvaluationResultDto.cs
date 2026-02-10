using System;
using System.Collections.Generic;

namespace ITPerformance.API.DTOs
{
    // Bir değerlendirmedeki tek bir kritere verilen puanın detayını tutar.
    public class ScoreResultDto
    {
        public string CriterionTitle { get; set; } = string.Empty;
        public byte Score { get; set; }
        public decimal? Weight{ get; set; }
    }

    // Bir çalışanın, tek bir geçmiş değerlendirme oturumunun tüm detaylarını tutar.
    public class EvaluationResultDto
    {
        public int EvaluationID { get; set; }
        public string Period { get; set; } = string.Empty;
        public DateTime EvaluationDate { get; set; }
        public decimal? OverallScore { get; set; }
        public string? Comments { get; set; }
        public string EvaluatorFullName { get; set; } = string.Empty; // Değerlendirmeyi yapan kişinin adı

        public string EmployeeFullName { get; set; } = string.Empty; // YENİ EKLENDİ
        public List<ScoreResultDto> Scores { get; set; } = new List<ScoreResultDto>();
        
    }
}
