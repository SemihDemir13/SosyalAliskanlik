// Dosya: .../Controllers/UserHabitsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Habit.Application.Interfaces;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Habit.Web.Controllers;

[ApiController]
[Route("api/users")] // Ana route: /api/users
[Authorize]
public class UserHabitsController : ControllerBase
{
    private readonly IHabitService _habitService;

    public UserHabitsController(IHabitService habitService)
    {
        _habitService = habitService;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{userId}/habits/summary")] // Tam Route: GET /api/users/{userId}/habits/summary
    public async Task<IActionResult> GetHabitSummary(Guid userId)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _habitService.GetUserHabitSummaryAsync(userId, currentUserId);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.Error });
        }

        if (result.Value == null)
        {
            // Kullanıcı bulunamadı veya arkadaş değiller.
            return Forbid(); // 403 Forbidden, bu kaynağı görme yetkin yok demektir.
        }
        
        return Ok(result.Value);
    }
}