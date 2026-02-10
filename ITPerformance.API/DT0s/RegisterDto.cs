using System.ComponentModel.DataAnnotations;

namespace ITPerformance.API.DTOs
{
    public class RegisterDto
    {
        

        [Required(ErrorMessage = "İsim zorunludur.")]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Soyisim zorunludur.")]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-posta zorunludur.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
        public string Password { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Departman seçimi zorunludur.")]
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir departman seçiniz.")]
        public int DepartmentID { get; set; }
    }
}
