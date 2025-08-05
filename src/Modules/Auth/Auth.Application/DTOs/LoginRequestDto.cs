// Dosya: src/Modules/Auth/Auth.Application/DTOs/LoginRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace SosyalAliskanlikApp.Modules.Auth.Application.DTOs;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }
}