using System.ComponentModel.DataAnnotations;

namespace ITPerformance.API.DTOs
{
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "Rol seçimi zorunludur.")]
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir rol seçiniz.")]
        public int RoleID { get; set; }

        [Required(ErrorMessage = "Departman Seçimi Zorunludur.")]
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir departman seçiniz")]
        public int DepartmentID{ get; set; }
    }
}