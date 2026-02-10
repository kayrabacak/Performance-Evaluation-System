namespace ITPerformance.API.DTOs
{
    public class RankingDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public string Period{ get; set; }
        
    }
}