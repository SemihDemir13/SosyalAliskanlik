// Dosya: src/Modules/Messaging/Application/DTOs/ConversationDto.cs
namespace SosyalAliskanlikApp.Modules.Messaging.Application.DTOs;

public class ConversationDto
{
    public Guid Id { get; set; }
    public Guid OtherUserId { get; set; }
    public required string OtherUserName { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageTimestamp { get; set; }
    public int UnreadCount { get; set; }
}