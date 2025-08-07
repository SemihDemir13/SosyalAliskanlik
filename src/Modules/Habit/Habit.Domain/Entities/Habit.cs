// Dosya: src/Modules/Habit/Habit.Domain/Entities/Habit.cs
using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Shared.Entities; // BaseEntity için

namespace SosyalAliskanlikApp.Modules.Habit.Domain.Entities;

public class Habit : BaseEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }

    // Bu alışkanlığın hangi kullanıcıya ait olduğunu belirtir.
    public Guid UserId { get; set; }

    public ICollection<HabitCompletion> HabitCompletions { get; set; } = new List<HabitCompletion>();
}