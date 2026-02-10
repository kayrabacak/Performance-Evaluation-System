using ITPerformance.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace ITPerformance.API.DataAccess
{
    public class PerformanceDbContext : DbContext
    {
        public PerformanceDbContext(DbContextOptions<PerformanceDbContext> options) : base(options)
        {
        }

        // DBSET leri burda tanımlıyoruz !!
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Department> Departments { get; set; } 
        public DbSet<Permission> Permissions { get; set; }  
        public DbSet<RolePermission> RolePermissions { get; set; } 
        public DbSet<Criterion> Criteria { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<EvaluationScore> EvaluationScores{ get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // RoleID ve PermissionID çiftinin benzersiz olmasını sağlayan kural.
            modelBuilder.Entity<RolePermission>()
                .HasIndex(rp => new { rp.RoleID, rp.PermissionID })
                .IsUnique();

            // --- HATA DÜZELTMESİ BURADA ---
            // Fluent API'yi, User sınıfındaki listeleri tanıyacak şekilde güncelliyoruz.

            // Değerlendirilen çalışan (Employee) ilişkisi
            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Employee)
                .WithMany(u => u.EvaluationsAsEmployee) // <-- ARTIK DOĞRU LİSTEYİ GÖSTERİYOR
                .HasForeignKey(e => e.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            // Değerlendirmeyi yapan Evaluator ilişkisi
            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Evaluator)
                .WithMany(u => u.EvaluationsAsEvaluator) // <-- ARTIK DOĞRU LİSTEYİ GÖSTERİYOR
                .HasForeignKey(e => e.EvaluatorID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
