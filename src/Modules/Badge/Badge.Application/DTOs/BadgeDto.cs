namespace SosyalAliskanlikApp.Modules.Badge.Application.DTOs;

public class BadgeDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string IconUrl { get; set; }
}