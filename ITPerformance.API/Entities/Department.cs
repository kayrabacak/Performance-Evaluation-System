using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITPerformance.API.Entities
{
    [Table("Departments")]
    public class Department
    {
        [Key]
        public int DepartmentID { get; set; }

        [Required]
        [StringLength(100)]
        public string DepartmentName { get; set; } = string.Empty;

        // Bir departmanın hangi kullanıcılara sahip olduğunu belirtir.
        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}
