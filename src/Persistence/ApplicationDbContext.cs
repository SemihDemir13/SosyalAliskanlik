using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Activity.Domain.Entities;
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Modules.Badge.Domain.Entities;
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
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Badge> Badges { get; set; }
    public DbSet<UserBadge> UserBadges { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        modelBuilder.Entity<Badge>().HasIndex(b => b.Code).IsUnique();
        SeedBadges(modelBuilder);
    }

    private void SeedBadges(ModelBuilder modelBuilder)
    {
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    modelBuilder.Entity<Badge>().HasData(
        new Badge
        {
            Id = Guid.Parse("ef70211c-3333-40a2-8233-a3a82f254593"), 
            Name = "İlk Adım",
            Description = "İlk alışkanlığını başarıyla tamamladın.",
            IconUrl = "/badges/first_step.png",
            Code = "FIRST_COMPLETION",
            CreatedAt = seedDate 
        },
        new Badge
        {
            Id = Guid.Parse("843425f1-3558-4d57-b672-466f9a53f191"),
            Name = "İstikrar Abidesi (7 Gün)",
            Description = "Bir alışkanlıkta 7 günlük seriye ulaştın.",
            IconUrl = "/badges/streak_7.png",
            Code = "STREAK_7_DAYS",
            CreatedAt = seedDate 
        },
        new Badge
        {
            Id = Guid.Parse("e838e55e-149a-41d3-a4c3-a36a2656919e"),
            Name = "Usta Takipçi (30 Gün)",
            Description = "Bir alışkanlıkta 30 günlük seriye ulaştın.",
            IconUrl = "/badges/streak_30.png",
            Code = "STREAK_30_DAYS",
            CreatedAt = seedDate 
        }
    );



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