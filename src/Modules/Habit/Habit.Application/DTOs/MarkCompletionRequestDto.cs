using System.ComponentModel.DataAnnotations;

namespace SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

public class MarkCompletionRequestDto
{
    [Required]
    public DateOnly CompletionDate { get; set; }
}