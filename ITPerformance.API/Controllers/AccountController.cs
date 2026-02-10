using ITPerformance.API.DataAccess;
using ITPerformance.API.DTOs;
using ITPerformance.API.Entities;
using ITPerformance.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace ITPerformance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly PerformanceDbContext _context;
        private readonly TokenService _tokenService;

        public AccountController(PerformanceDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        // Register metodunda bir değişiklik yok, tamamen doğru.
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest("Bu e-posta adresi zaten kullanılıyor.");
            }

            if (!await _context.Departments.AnyAsync(d => d.DepartmentID == registerDto.DepartmentID))
            {
                return BadRequest("Geçersiz departman seçimi.");
            }

            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = PasswordService.HashPassword(registerDto.Password),
                IsActive = true,
                RoleID = 3, // Varsayılan olarak "Employee"
                DepartmentID = registerDto.DepartmentID,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Kullanıcı başarıyla oluşturuldu." });
        }

        // --- GÜNCELLEME BURADA: Login metodu artık rol bilgisini de dönecek ---
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // Kullanıcıyı çekerken, ona bağlı olan Role nesnesini de getirmesini söylüyoruz.
            var user = await _context.Users
                .Include(u => u.Role) 
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !PasswordService.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized("Geçersiz e-posta veya şifre.");
            }
            
            if (!user.IsActive)
            {
                return Unauthorized("Kullanıcı hesabı aktif değil.");
            }

            // DTO'yu doldururken, kullanıcının rol adını da ekliyoruz.
            return new UserDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user),
                Role = user.Role.RoleName //role cekmemiz gerek. auth icin
            };
        }
    }
}
