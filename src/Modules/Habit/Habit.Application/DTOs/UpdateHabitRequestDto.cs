// Dosya: src/Modules/Habit/Habit.Application/DTOs/UpdateHabitRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

public class UpdateHabitRequestDto
{
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }
}