// Dosya: src/Modules/Messaging/Application/Interfaces/IMessagingService.cs
using SosyalAliskanlikApp.Modules.Messaging.Application.DTOs;
using SosyalAliskanlikApp.Shared;

namespace SosyalAliskanlikApp.Modules.Messaging.Application.Interfaces;

public interface IMessagingService
{
    Task<Result<List<ConversationDto>>> GetConversationsAsync(Guid currentUserId);
    Task<Result<List<MessageDto>>> GetMessagesAsync(Guid conversationId, Guid currentUserId);
    Task<Result<MessageDto>> SendMessageAsync(Guid senderId, Guid receiverId, string content);
    Task<Result> MarkAsReadAsync(Guid conversationId, Guid currentUserId);
}