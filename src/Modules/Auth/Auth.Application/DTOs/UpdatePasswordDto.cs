// Dosya: .../DTOs/UpdatePasswordDto.cs
using System.ComponentModel.DataAnnotations;

namespace SosyalAliskanlikApp.Modules.Auth.Application.DTOs;

public class UpdatePasswordDto
{
    [Required]
    public required string CurrentPassword { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Yeni şifre en az 6 karakter olmalıdır.")]
    public required string NewPassword { get; set; }
}