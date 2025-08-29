using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Badge.Application.Interfaces;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Badge.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BadgesController : ControllerBase
{
    private readonly IBadgeService _badgeService;

    public BadgesController(IBadgeService badgeService)
    {
        _badgeService = badgeService;
    }

    // Kullanıcının kendi rozetlerini getiren endpoint
    [HttpGet("my")] 
    public async Task<IActionResult> GetMyBadges()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdString is null || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var badges = await _badgeService.GetUserBadgesAsync(userId);
        return Ok(badges);
    }

    // Başka bir kullanıcının rozetlerini getiren endpoint
    [HttpGet("user/{userId:guid}")] 
    public async Task<IActionResult> GetUserBadges(Guid userId)
    {
        // TODO: İleride, sadece arkadaşların rozetlerini görme gibi bir yetkilendirme eklenebilir.
        var badges = await _badgeService.GetUserBadgesAsync(userId);
        return Ok(badges);
    }
    
     [HttpPost("recheck")] 
    public async Task<IActionResult> RecheckBadges()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userIdString is null || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        await _badgeService.RecheckAllBadgesForUserAsync(userId);
        
        
        return NoContent(); 
    }
}