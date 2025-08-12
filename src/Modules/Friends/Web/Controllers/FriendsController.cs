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
}