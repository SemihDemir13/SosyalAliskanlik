using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Habit.Application.DTOs;
using SosyalAliskanlikApp.Modules.Habit.Application.Interfaces;

namespace SosyalAliskanlikApp.Modules.Habit.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    public async Task<IActionResult> GetHabits([FromQuery] bool includeArchived = false)
    {
        var userId = GetCurrentUserId();
        // Servise yeni parametreyi gönderiyoruz
        var habits = await _habitService.GetHabitsByUserIdAsync(userId, includeArchived);
        return Ok(habits);
    }
     [HttpPost("{habitId}/archive")]
    public async Task<IActionResult> ArchiveHabit(string habitId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _habitService.ArchiveHabitAsync(habitId, userId);
        if (!result.IsSuccess) return BadRequest(result.Error);

        return NoContent(); // Başarılı, ama geri döndürülecek bir içerik yok.
    }

    [HttpPost("{habitId}/unarchive")]
    public async Task<IActionResult> UnarchiveHabit(string habitId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _habitService.UnarchiveHabitAsync(habitId, userId);
        if (!result.IsSuccess) return BadRequest(result.Error);

        return NoContent(); // Başarılı, ama geri döndürülecek bir içerik yok.
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

    [HttpPost("{id}/completions")]
    public async Task<IActionResult> MarkCompletion(Guid id, [FromBody] MarkCompletionRequestDto request)
    {
        var userId = GetCurrentUserId();
        var result = await _habitService.MarkHabitAsCompletedAsync(id, request.CompletionDate, userId);

        if (result == null)
        {
            return NotFound("Habit not found or you don't have permission to access it.");
        }

        return Ok(result);
    }

    // Bir alışkanlığın tamamlanma işaretini kaldırır.
    // DELETE /api/habits/{id}/completions/{date}
    [HttpDelete("{id}/completions/{date}")]
    public async Task<IActionResult> UnmarkCompletion(Guid id, DateOnly date)
    {
        var userId = GetCurrentUserId();
        var success = await _habitService.UnmarkHabitAsCompletedAsync(id, date, userId);

        if (!success)
        {
            return NotFound("Completion record not found for the specified date.");
        }

        return NoContent();
    }

    // Bir alışkanlığın tüm tamamlanma tarihlerini getirir.
    // GET /api/habits/{id}/completions
    [HttpGet("{id}/completions")]
    public async Task<IActionResult> GetCompletions(Guid id)
    {
        var userId = GetCurrentUserId();
        var dates = await _habitService.GetHabitCompletionsAsync(id, userId);
        return Ok(dates);
    }
    
     [HttpPost("{habitId}/toggle")]
    public async Task<IActionResult> ToggleHabitCompletion(string habitId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _habitService.ToggleHabitCompletionAsync(habitId, userId);

        if (!result.IsSuccess)
        {
            return BadRequest(result.Error);
        }

        return Ok(); // Sadece başarılı olduğunu belirtmek yeterli
    }
    
}