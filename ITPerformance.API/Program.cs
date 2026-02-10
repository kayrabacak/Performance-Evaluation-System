using ITPerformance.API.DataAccess;
using ITPerformance.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json; // Gerekli olabilir diye ekledim, ama genellikle otomatik tanınır.

var builder = WebApplication.CreateBuilder(args);

// ------------------- Servislerin Yapılandırılması -------------------

builder.Services.AddScoped<TokenService>();

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:5175","http://localhost:5173","http://localhost:3000","http://localhost:5176","http://localhost:5174","http://localhost:5124" )
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<PerformanceDbContext>(options =>
    options.UseSqlServer(connectionString));

// GÜNCELLEME BURADA YAPILDI
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();

// --- GÜNCELLEME BURADA: Swagger'a Yetkilendirme Desteği Düzeltildi ---
builder.Services.AddSwaggerGen(options =>
{
    // Swagger'a, API'mızın standart bir "Bearer" token (JWT) kullandığını söylüyoruz.
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Lütfen token'ı girin",
        Name = "Authorization",
        Type = SecuritySchemeType.Http, // ApiKey yerine Http kullanmak daha standart ve güvenilirdir.
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
// --- Bitiş ---


var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new ArgumentNullException(nameof(jwtKey), "JWT Key (Jwt:Key) appsettings.json dosyasında bulunamadı veya boş.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Token doğrulama sırasında bir hata olursa, bu olayı dinle ve hatayı konsola yaz.
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("TOKEN DOĞRULAMA HATASI: " + context.Exception.Message);
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(); // Yetkilendirme servisini de ekliyoruz.

// ------------------- Uygulamanın Oluşturulması -------------------
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins);

// Doğru Sıralama: Önce kimlik tespiti, sonra yetki kontrolü
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();