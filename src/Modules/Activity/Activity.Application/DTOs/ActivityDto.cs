namespace SosyalAliskanlikApp.Modules.Activity.Application.DTOs;

public class ActivityDto
{
    public Guid Id { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string UserName { get; set; }
    
}