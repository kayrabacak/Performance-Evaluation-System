using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITPerformance.API.Entities
{
    [Table("Permissions")]
    public class Permission
    {
        [Key]
        public int PermissionID { get; set; }

        [Required]
        [StringLength(100)]
        public string PermissionName { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Description { get; set; }

        // role permission listesi
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
