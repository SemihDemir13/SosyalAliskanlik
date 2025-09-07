// Dosya: src/Modules/Messaging/Web/Controllers/MessagingController.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Messaging.Application.DTOs;
using SosyalAliskanlikApp.Modules.Messaging.Application.Interfaces;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Messaging.Web.Controllers;

[Authorize] // Bu controller'daki tüm endpoint'ler kimlik doğrulaması gerektirir.
[ApiController]
[Route("api/[controller]")]
public class MessagingController : ControllerBase
{
    private readonly IMessagingService _messagingService;

    public MessagingController(IMessagingService messagingService)
    {
        _messagingService = messagingService;
    }

    private Guid GetCurrentUserId() => 
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var currentUserId = GetCurrentUserId();
        var result = await _messagingService.GetConversationsAsync(currentUserId);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("conversations/{conversationId:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid conversationId)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _messagingService.GetMessagesAsync(conversationId, currentUserId);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var senderId = GetCurrentUserId();
        var result = await _messagingService.SendMessageAsync(senderId, request.ReceiverId, request.Content);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("conversations/{conversationId:guid}/mark-as-read")]
    public async Task<IActionResult> MarkAsRead(Guid conversationId)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _messagingService.MarkAsReadAsync(conversationId, currentUserId);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }
}

public class SendMessageRequest
{
    public Guid ReceiverId { get; set; }
    public required string Content { get; set; }
}