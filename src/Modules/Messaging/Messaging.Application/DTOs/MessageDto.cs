// Dosya: src/Modules/Messaging/Application/DTOs/MessageDto.cs
namespace SosyalAliskanlikApp.Modules.Messaging.Application.DTOs;

public class MessageDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}