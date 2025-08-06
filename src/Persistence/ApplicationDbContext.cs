using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Modules.Habit.Domain.Entities;
using System.Reflection;

namespace SosyalAliskanlikApp.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Auth modülünün User entity'sini "Users" adıyla bir tabloya eşle.
    public DbSet<User> Users { get; set; }
    public DbSet<Habit> Habits { get; set; } 

    
    

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Bu satır, bu assembly (Persistence projesi) içindeki tüm
        // IEntityTypeConfiguration dosyalarını otomatik olarak bulup uygular.
        // Bu, DbContext'i temiz tutan çok iyi bir pratiktir.
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(modelBuilder);
    }
}