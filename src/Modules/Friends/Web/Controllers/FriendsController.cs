// Dosya: src/Modules/Friends/Web/Controllers/FriendsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Friends.Application.DTOs;
using SosyalAliskanlikApp.Modules.Friends.Application.Interfaces;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Friends.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Bu Controller'a sadece giriş yapmış kullanıcılar erişebilir.
public class FriendsController : ControllerBase
{
    private readonly IFriendshipService _friendshipService;

    public FriendsController(IFriendshipService friendshipService)
    {
        _friendshipService = friendshipService;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("requests")] // Route: POST /api/friends/requests
    public async Task<IActionResult> SendFriendRequest([FromBody] SendFriendRequestDto request)
    {
        var requesterId = GetCurrentUserId();
        var result = await _friendshipService.SendRequestAsync(request, requesterId);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.Error });
        }

        return Ok(new { message = "Arkadaşlık isteği başarıyla gönderildi." });
    }

    // Gelen arkadaşlık isteklerini listeler
    // GET /api/friends/requests/pending
    [HttpGet("requests/pending")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var userId = GetCurrentUserId();
        var result = await _friendshipService.GetPendingRequestsAsync(userId);
        return Ok(result.Value);
    }

    // Bir arkadaşlık isteğini kabul eder
    // POST /api/friends/requests/{id}/accept
    [HttpPost("requests/{id}/accept")]
    public async Task<IActionResult> AcceptRequest(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _friendshipService.AcceptRequestAsync(id, userId);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.Error });
        }

        return Ok(new { message = "Arkadaşlık isteği kabul edildi." });
    }

    // Bir arkadaşlık isteğini reddeder
    // POST /api/friends/requests/{id}/decline
    [HttpPost("requests/{id}/decline")]
    public async Task<IActionResult> DeclineRequest(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _friendshipService.DeclineRequestAsync(id, userId);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.Error });
        }

        return Ok(new { message = "Arkadaşlık isteği reddedildi." });
    }
    [HttpGet("")] // Route: GET /api/friends
    public async Task<IActionResult> GetFriends()
    {
        var userId = GetCurrentUserId();
        var result = await _friendshipService.GetFriendsAsync(userId);

        // IsFailure kontrolü eklemek her zaman daha güvenlidir.
        if (result.IsFailure)
        {
            return BadRequest(new { message = result.Error });
        }

        return Ok(result.Value);
    }
    [HttpDelete("{friendshipId}")] // Route: DELETE /api/friends/{friendshipId}
    public async Task<IActionResult> RemoveFriend(Guid friendshipId)
    {
        var userId = GetCurrentUserId();
        var result = await _friendshipService.RemoveFriendAsync(friendshipId, userId);

        if (result.IsFailure)
        {
            
            return BadRequest(new { message = result.Error });
        }

        return Ok(new { message = "Arkadaş başarıyla silindi." });
    }
}