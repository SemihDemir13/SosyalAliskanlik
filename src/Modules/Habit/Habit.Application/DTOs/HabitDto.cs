// Dosya: src/Modules/Habit/Habit.Application/DTOs/HabitDto.cs
namespace SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

public class HabitDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<DateOnly> Completions { get; set; } = new();

}