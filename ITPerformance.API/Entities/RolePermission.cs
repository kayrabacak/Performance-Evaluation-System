using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITPerformance.API.Entities
{
    [Table("RolePermissions")]
    public class RolePermission
    {
        [Key]
        public int RolePermissionID { get; set; }

        // Foreign Keys
        public int RoleID { get; set; }
        public int PermissionID { get; set; }

        // Navigation Properties
        [ForeignKey("RoleID")]
        public virtual Role Role { get; set; } = null!;

        [ForeignKey("PermissionID")]
        public virtual Permission Permission { get; set; } = null!;
    }
}
