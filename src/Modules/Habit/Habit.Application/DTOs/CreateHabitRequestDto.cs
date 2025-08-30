// Dosya: src/Modules/Habit/Habit.Application/DTOs/CreateHabitRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

public class CreateHabitRequestDto
{
   [Required(ErrorMessage = "İsim alanı zorunludur.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "İsim 2 ile 50 karakter arasında olmalıdır.")]
    public required string Name { get; set; }

    [StringLength(150, ErrorMessage = "Açıklama 150 karakterden uzun olamaz.")]
    public string? Description { get; set; }
}