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
        return CreatedAtAction(nameof(GetHabitById), new { id = createdHabit.Id }, createdHabit);
    }
    [HttpGet("{id}")] // Route: GET /api/habits/{alışkanlık_id}
    public async Task<IActionResult> GetHabitById(Guid id)
    {
        var userId = GetCurrentUserId();
        var habit = await _habitService.GetHabitByIdAsync(id, userId);

        if (habit == null)
        {
            return NotFound();
        }

        return Ok(habit);
    }

    [HttpGet]
    public async Task<IActionResult> GetHabits()
    {
        var userId = GetCurrentUserId();
        var habits = await _habitService.GetHabitsByUserIdAsync(userId);
        return Ok(habits);
    }
    [HttpPut("{id}")] // Route: PUT /api/habits/{alışkanlık_id}
    public async Task<IActionResult> UpdateHabit(Guid id, [FromBody] UpdateHabitRequestDto request)
    {
        var userId = GetCurrentUserId();
        var updatedHabit = await _habitService.UpdateHabitAsync(id, request, userId);

        if (updatedHabit == null)
        {
            // Servis null döndüyse, bu ya kaynak bulunamadı (404 Not Found)
            // ya da kullanıcının bu kaynağa erişim izni yok (403 Forbidden) demektir.
            // Güvenlik açısından 404 dönmek daha iyidir, saldırgana ipucu vermez.
            return NotFound();
        }

        return Ok(updatedHabit); // Başarılı olursa 200 OK ve güncellenmiş veriyi dön.
    }

    [HttpDelete("{id}")] // Route: DELETE /api/habits/{alışkanlık_id}
    public async Task<IActionResult> DeleteHabit(Guid id)
    {
        var userId = GetCurrentUserId();
        var success = await _habitService.DeleteHabitAsync(id, userId);

        if (!success)
        {
            return NotFound();

        }

        return NoContent();
    }
    
}