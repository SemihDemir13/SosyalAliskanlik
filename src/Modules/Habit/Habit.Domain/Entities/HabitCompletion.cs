// Dosya: src/Modules/Habit/Habit.Domain/Entities/HabitCompletion.cs
using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Shared.Entities; // BaseEntity için

namespace SosyalAliskanlikApp.Modules.Habit.Domain.Entities;

public class HabitCompletion : BaseEntity
{
    // Hangi alışkanlığın tamamlandığını gösteren Foreign Key.
    public Guid HabitId { get; set; }
    public  Habit Habit { get; set; } = null!; // Navigation Property

    // Alışkanlığın tamamlandığı tarih. Saat bilgisine ihtiyacımız yok.
    public DateOnly CompletionDate { get; set; }
}