// Dosya: .../DTOs/HabitSummaryDto.cs
namespace SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

// Tek bir alışkanlığın özetini temsil eder
public class HabitSummaryDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    // Son 7 günde kaç kez tamamlandığı gibi bir bilgi
    public int CompletionsLastWeek { get; set; }
}