using ITPerformance.API.DataAccess; // DbContext için eklendi
using ITPerformance.API.Entities;
using Microsoft.EntityFrameworkCore; // Include metodu için eklendi
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks; // Task için eklendi

namespace ITPerformance.API.Services
{
    public class TokenService
    {
        private readonly SymmetricSecurityKey _key;
        private readonly IConfiguration _config;
        private readonly PerformanceDbContext _context;
        // veritabanı bağlantısı 

        // DbContext'i de alacak şekilde constructor'ı güncelledik.
        public TokenService(IConfiguration config, PerformanceDbContext context)
        {
            _config = config;
            _context = context; // veritabanı bağlantısını tanımlıyoruz
            var key = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(key))
            {
                throw new ArgumentNullException(nameof(key), "JWT Key (Jwt:Key) appsettings.json dosyasında bulunamadı veya boş.");
            }
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        }

        // metod -> async çünkü veritabanından alıcaz.
        public async Task<string> CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.NameId, user.UserID.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
            };

            
            // roleid veritabanından cekiyoruz. rolename le birlikte
            var role = await _context.Roles.FindAsync(user.RoleID);
            if (role != null)
            {
                // Rolü, özel bir "claim" türü olarak token'a ekliyoruz.
                // Bu, yetkilendirmenin temelidir.
                claims.Add(new Claim(ClaimTypes.Role, role.RoleName));
            }
           

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
