using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITPerformance.API.Entities
{

    [Table("Roles")]
    public class Role
    {
        [Key]
        public int RoleID { get; set; }

        [Required]
        [StringLength(50)]
        public string RoleName { get; set; } = string.Empty;


        // sadece C# içinde ilişkileri yönetiyoruz burda
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        
         public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
