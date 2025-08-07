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


    public DbSet<User> Users { get; set; }
    public DbSet<Habit> Habits { get; set; } 
    public DbSet<HabitCompletion> HabitCompletions { get; set; } 


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(modelBuilder);
    }
}