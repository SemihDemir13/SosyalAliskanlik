using SosyalAliskanlikApp.Shared.Entities;

namespace SosyalAliskanlikApp.Modules.Auth.Domain.Entities;

public class User : BaseEntity
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public bool EmailConfirmed { get; set; } = false;
    public string? EmailConfirmationToken { get; set; }
    public DateTime? ConfirmationTokenExpiry { get; set; }
}
