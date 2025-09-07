// Dosya: src/Modules/Messaging/Application/Services/MessagingService.cs

using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Messaging.Application.DTOs;
using SosyalAliskanlikApp.Modules.Messaging.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Messaging.Domain.Entities;
using SosyalAliskanlikApp.Modules.Notification.Application.Interfaces;
using SosyalAliskanlikApp.Persistence;
using SosyalAliskanlikApp.Shared;

namespace SosyalAliskanlikApp.Modules.Messaging.Application.Services;

public class MessagingService : IMessagingService
{
    private readonly ApplicationDbContext _context;
    private readonly IActivityHubClient _activityHubClient;

    public MessagingService(ApplicationDbContext context, IActivityHubClient activityHubClient)
    {
        _context = context;
        _activityHubClient = activityHubClient;
    }

    public async Task<Result<List<ConversationDto>>> GetConversationsAsync(Guid currentUserId)
    {
        var conversations = await _context.Conversations
            .Where(c => c.User1Id == currentUserId || c.User2Id == currentUserId)
            .Include(c => c.Messages)
            .Include(c => c.User1)
            .Include(c => c.User2)
            .Select(c => new ConversationDto
            {
                Id = c.Id,
                OtherUserId = c.User1Id == currentUserId ? c.User2Id : c.User1Id,
                OtherUserName = c.User1Id == currentUserId ? c.User2.Name : c.User1.Name,
                LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Content).FirstOrDefault(),
                LastMessageTimestamp = c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => (DateTime?)m.CreatedAt).FirstOrDefault(),
                UnreadCount = c.Messages.Count(m => !m.IsRead && m.SenderId != currentUserId)
            })
            .OrderByDescending(dto => dto.LastMessageTimestamp)
            .ToListAsync();
            
        return Result.Success(conversations);
    }

    public async Task<Result<List<MessageDto>>> GetMessagesAsync(Guid conversationId, Guid currentUserId)
    {
        var conversationExists = await _context.Conversations
            .AnyAsync(c => c.Id == conversationId && (c.User1Id == currentUserId || c.User2Id == currentUserId));

        if (!conversationExists)
        {
            return Result.Failure<List<MessageDto>>("Konuşma bulunamadı veya bu konuşmayı görüntüleme yetkiniz yok.");
        }

        var messages = await _context.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead
            })
            .ToListAsync();

        return Result.Success(messages);
    }

    public async Task<Result<MessageDto>> SendMessageAsync(Guid senderId, Guid receiverId, string content)
    {
        if (senderId == receiverId)
            return Result.Failure<MessageDto>("Kendinize mesaj gönderemezsiniz.");

        // İki kullanıcı arasında zaten bir konuşma var mı diye kontrol et
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => 
                (c.User1Id == senderId && c.User2Id == receiverId) ||
                (c.User1Id == receiverId && c.User2Id == senderId));
        
        if (conversation == null)
        {
            conversation = new Conversation
            {
                User1Id = senderId,
                User2Id = receiverId
            };
            await _context.Conversations.AddAsync(conversation);
        }

        var message = new Message
        {
            Conversation = conversation,
            SenderId = senderId,
            Content = content,
            IsRead = false
        };

        await _context.Messages.AddAsync(message);
        await _context.SaveChangesAsync();

        var messageDto = new MessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            Content = message.Content,
            CreatedAt = message.CreatedAt,
            IsRead = message.IsRead
        };
        
        // Mesajı alıcıya anlık olarak gönder
        await _activityHubClient.SendNotificationToUserAsync(
            receiverId.ToString(),
            "ReceiveMessage",
            messageDto
        );
        
        return Result.Success(messageDto);
    }

    public async Task<Result> MarkAsReadAsync(Guid conversationId, Guid currentUserId)
    {
        var messagesToUpdate = await _context.Messages
            .Where(m => m.ConversationId == conversationId && m.SenderId != currentUserId && !m.IsRead)
            .ToListAsync();

        if (messagesToUpdate.Any())
        {
            foreach (var message in messagesToUpdate)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
        }

        return Result.Success();
    }
}