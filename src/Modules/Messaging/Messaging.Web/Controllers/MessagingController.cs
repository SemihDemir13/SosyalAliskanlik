// Dosya: src/Modules/Messaging/Web/Controllers/MessagingController.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SosyalAliskanlikApp.Modules.Messaging.Application.DTOs;
using SosyalAliskanlikApp.Modules.Messaging.Application.Interfaces;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Messaging.Web.Controllers;

[Authorize] 
[ApiController]
[Route("api/[controller]")]
public class MessagingController : ControllerBase
{
    private readonly IMessagingService _messagingService;
    private readonly ILogger<MessagingController> _logger;

    public MessagingController(IMessagingService messagingService, ILogger<MessagingController> logger)
    {
        _messagingService = messagingService;
        _logger = logger;
    }

    private Guid GetCurrentUserId() => 
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Kullanıcı {UserId} için konuşmalar getiriliyor.", currentUserId);
        
        var result = await _messagingService.GetConversationsAsync(currentUserId);

        if (result.IsSuccess)
        {
            // DÜZELTME: 'result.Value'nun null olmayacağını belirtmek için '!' eklendi.
            _logger.LogInformation("{Count} adet konuşma başarıyla getirildi: Kullanıcı {UserId}", result.Value!.Count, currentUserId);
            return Ok(result.Value);
        }

        _logger.LogWarning("Konuşmalar getirilemedi: Kullanıcı {UserId}, Hata: {Error}", currentUserId, result.Error);
        return BadRequest(result.Error);
    }

    [HttpGet("conversations/{conversationId:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid conversationId)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Konuşma {ConversationId} için mesajlar getiriliyor: Kullanıcı {UserId}", conversationId, currentUserId);
        
        var result = await _messagingService.GetMessagesAsync(conversationId, currentUserId);
        
        if (result.IsSuccess)
        {
            // DÜZELTME: 'result.Value'nun null olmayacağını belirtmek için '!' eklendi.
            _logger.LogInformation("{Count} adet mesaj başarıyla getirildi: Konuşma {ConversationId}, Kullanıcı {UserId}", result.Value!.Count, conversationId, currentUserId);
            return Ok(result.Value);
        }

        _logger.LogWarning("Mesajlar getirilemedi: Konuşma {ConversationId}, Kullanıcı {UserId}, Hata: {Error}", conversationId, currentUserId, result.Error);
        return BadRequest(result.Error);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var senderId = GetCurrentUserId();
        _logger.LogInformation("Yeni mesaj gönderiliyor: Gönderen {SenderId}, Alıcı {ReceiverId}", senderId, request.ReceiverId);
        
        var result = await _messagingService.SendMessageAsync(senderId, request.ReceiverId, request.Content);

        if (result.IsSuccess)
        {
            // DÜZELTME: 'result.Value'nun null olmayacağını belirtmek için '!' eklendi.
            _logger.LogInformation("Mesaj başarıyla gönderildi: MesajId {MessageId}, Gönderen {SenderId}, Alıcı {ReceiverId}", result.Value!.Id, senderId, request.ReceiverId);
            return Ok(result.Value);
        }

        _logger.LogError("Mesaj gönderilemedi: Gönderen {SenderId}, Alıcı {ReceiverId}, Hata: {Error}", senderId, request.ReceiverId, result.Error);
        return BadRequest(result.Error);
    }

    [HttpPost("conversations/{conversationId:guid}/mark-as-read")]
    public async Task<IActionResult> MarkAsRead(Guid conversationId)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Konuşma {ConversationId} okundu olarak işaretleniyor: Kullanıcı {UserId}", conversationId, currentUserId);
        
        var result = await _messagingService.MarkAsReadAsync(currentUserId, conversationId);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Konuşma {ConversationId} başarıyla okundu olarak işaretlendi: Kullanıcı {UserId}", conversationId, currentUserId);
            return Ok();
        }

        _logger.LogWarning("Konuşma okundu olarak işaretlenemedi: Konuşma {ConversationId}, Kullanıcı {UserId}, Hata: {Error}", conversationId, currentUserId, result.Error);
        return BadRequest(result.Error);
    }
}

public class SendMessageRequest
{
    public Guid ReceiverId { get; set; }
    public required string Content { get; set; }
}