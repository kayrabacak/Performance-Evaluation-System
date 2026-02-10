using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ITPerformance.API.DTOs
{
    // Bu ana DTO, frontend'den gönderilen tüm değerlendirme formunu temsil eder.
    public class SubmitEvaluationDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public string Period { get; set; } = string.Empty;

        public string? Comments { get; set; }

        [Required]
        // Artık 'ScoreDto' sınıfını kendi dosyasından tanıyor.
        public List<ScoreDto> Scores { get; set; } = new List<ScoreDto>();
    }
}
