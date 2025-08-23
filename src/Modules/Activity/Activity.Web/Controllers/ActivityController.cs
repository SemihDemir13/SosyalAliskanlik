using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Activity.Application.Interfaces;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Activity.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivityController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userIdString is null || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var feed = await _activityService.GetActivityFeedAsync(userId);
        return Ok(feed);
    }
}