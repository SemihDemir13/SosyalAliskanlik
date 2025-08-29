using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.AI.Application.Interfaces;
namespace SosyalAliskanlikApp.Modules.AI.Web.Controllers;
[Authorize] [ApiController] [Route("api/[controller]")]
public class AIController : ControllerBase {
    private readonly IAIService _aiService;
    public AIController(IAIService aiService) { _aiService = aiService; }
    [HttpPost("suggest-habits")]
    public async Task<IActionResult> SuggestHabits([FromBody] string userGoal) {
        if (string.IsNullOrWhiteSpace(userGoal)) return BadRequest("Hedef boş olamaz.");
        var result = await _aiService.GetHabitSuggestionsAsync(userGoal);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}