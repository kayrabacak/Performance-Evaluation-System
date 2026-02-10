using System.ComponentModel.DataAnnotations;

namespace ITPerformance.API.DTOs
{
    // token ve güvenli bilgi donuyoruz burda 
    public class UserDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
