// Dosya: src/Modules/Auth/Auth.Application/DTOs/UpdateProfileDto.cs
using System.ComponentModel.DataAnnotations;

namespace SosyalAliskanlikApp.Modules.Auth.Application.DTOs;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "İsim alanı boş bırakılamaz.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "İsim en az 2, en fazla 100 karakter olmalıdır.")]
    public required string Name { get; set; }
}