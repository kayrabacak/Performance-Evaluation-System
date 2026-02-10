using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITPerformance.API.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int RoleID { get; set; }
        public int DepartmentID { get; set; }

        // --- Navigation Properties ---
        [ForeignKey("RoleID")]
        public virtual Role Role { get; set; } = null!;

        [ForeignKey("DepartmentID")]
        public virtual Department Department { get; set; } = null!;

        [InverseProperty("Employee")]
        public virtual ICollection<Evaluation> EvaluationsAsEmployee { get; set; } = new List<Evaluation>();

        [InverseProperty("Evaluator")]
        public virtual ICollection<Evaluation> EvaluationsAsEvaluator { get; set; } = new List<Evaluation>();
    }
}
