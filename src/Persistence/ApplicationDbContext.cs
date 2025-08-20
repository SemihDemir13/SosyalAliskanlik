using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Modules.Friends.Domain.Entities;
using SosyalAliskanlikApp.Modules.Habit.Domain.Entities;
using System.Reflection;

namespace SosyalAliskanlikApp.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Habit> Habits { get; set; }
    public DbSet<HabitCompletion> HabitCompletions { get; set; }
    public DbSet<Friendship> Friendships { get; set; }
    
    

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Önce base metodu çağırmak genellikle daha iyi bir pratiktir.
        base.OnModelCreating(modelBuilder);

        // Bu, IEntityTypeConfiguration kullanan ayrı konfigürasyon dosyalarını bulur.
        // Henüz böyle bir dosyamız yok ama gelecekte kullanmak için kalabilir.
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Friendship ilişkilerini AÇIKÇA ve DOĞRU bir şekilde yapılandırıyoruz.


        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Requester)
            .WithMany()
            .HasForeignKey(f => f.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Addressee)
            .WithMany()
            .HasForeignKey(f => f.AddresseeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HabitCompletion>()
        .HasOne(hc => hc.Habit)
        .WithMany(h => h.HabitCompletions)
        .HasForeignKey(hc => hc.HabitId)
        .OnDelete(DeleteBehavior.Cascade);
    }
}