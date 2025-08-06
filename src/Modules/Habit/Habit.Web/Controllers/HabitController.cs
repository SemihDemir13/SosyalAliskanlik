using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Habit.Application.DTOs;
using SosyalAliskanlikApp.Modules.Habit.Application.Interfaces;

namespace SosyalAliskanlikApp.Modules.Habit.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // BU TÜM CONTROLLER'I KORUR!
public class HabitController : ControllerBase
{
    private readonly IHabitService _habitService;

    public HabitController(IHabitService habitService)
    {
        _habitService = habitService;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> CreateHabit([FromBody] CreateHabitRequestDto request)
    {
        var userId = GetCurrentUserId();
        var createdHabit = await _habitService.CreateHabitAsync(request, userId);
        return CreatedAtAction(nameof(GetHabits), new { id = createdHabit.Id }, createdHabit);
    }

    [HttpGet]
    public async Task<IActionResult> GetHabits()
    {
        var userId = GetCurrentUserId();
        var habits = await _habitService.GetHabitsByUserIdAsync(userId);
        return Ok(habits);
    }
}