namespace SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

public class HabitCompletionDto
{
    public Guid Id { get; set; }
    public Guid HabitId { get; set; }
    public DateOnly CompletionDate { get; set; }
}