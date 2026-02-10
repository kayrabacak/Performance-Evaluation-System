using ITPerformance.API.DataAccess;
using ITPerformance.API.DTOs;
using ITPerformance.API.Entities; // 'User' sınıfının adresi
using ITPerformance.API.Services; // 'PasswordService' sınıfının adresi
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System; // 'DateTime' için gerekli
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ITPerformance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly PerformanceDbContext _context;

        public UsersController(PerformanceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDetailDto>>> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Department)
                .Select(u => new UserDetailDto
                {
                    UserID = u.UserID,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    RoleID = u.RoleID,
                    RoleName = u.Role.RoleName,
                    DepartmentID = u.DepartmentID,
                    DepartmentName = u.Department.DepartmentName,
                    IsActive = u.IsActive
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto updateUserDto)
        {
            var userToUpdate = await _context.Users.FindAsync(id);
            if (userToUpdate == null)
            {
                return NotFound("Güncellenecek kullanıcı bulunamadı.");
            }
            userToUpdate.RoleID = updateUserDto.RoleID;
            userToUpdate.DepartmentID = updateUserDto.DepartmentID;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("Durumu değiştirilecek kullanıcı bulunamadı.");
            }
            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<UserDetailDto>> CreateUser(AdminCreateUserDto createUserDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
            {
                return BadRequest("Bu e-posta adresi zaten kullanılıyor.");
            }

            var user = new User
            {
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                Email = createUserDto.Email,
                PasswordHash = PasswordService.HashPassword(createUserDto.Password),
                IsActive = true,
                RoleID = createUserDto.RoleID,
                DepartmentID = createUserDto.DepartmentID,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            var createdUserDto = new UserDetailDto
            {
                UserID = user.UserID,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RoleName = (await _context.Roles.FindAsync(user.RoleID))?.RoleName ?? "",
                DepartmentName = (await _context.Departments.FindAsync(user.DepartmentID))?.DepartmentName ?? "",
                IsActive = user.IsActive
            };

            return CreatedAtAction(nameof(GetAllUsers), new { id = user.UserID }, createdUserDto);
        }
    }
}
