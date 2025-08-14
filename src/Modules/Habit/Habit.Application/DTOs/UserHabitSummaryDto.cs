// Dosya: .../DTOs/UserHabitSummaryDto.cs
namespace SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

public class UserHabitSummaryDto
{
    public required string UserName { get; set; }
    public List<HabitSummaryDto> Habits { get; set; } = new();
}