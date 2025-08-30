// Dosya: src/Modules/Habit/Habit.Domain/Entities/Habit.cs
using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Shared.Entities; // BaseEntity için
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace SosyalAliskanlikApp.Modules.Habit.Domain.Entities;

public class Habit : BaseEntity
{

     
    [Required]
    [MaxLength(50)] 
    public required string Name { get; set; }

    [MaxLength(150)] 
     public string? Description { get; set; }

    // Bu alışkanlığın hangi kullanıcıya ait olduğunu belirtecek.
    public Guid UserId { get; set; }

    public virtual User User { get; set; } = null!;
    
    public bool IsArchived { get; set; } = false;

    public ICollection<HabitCompletion> HabitCompletions { get; set; } = new List<HabitCompletion>();

}