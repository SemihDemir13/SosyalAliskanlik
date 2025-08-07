using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Statistics.Application.Interfaces;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Statistics.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Bu Controller'a sadece giriş yapmış kullanıcılar erişebilir.
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    // Token'dan o anki kullanıcının ID'sini okuyan yardımcı metotum
    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("my-summary")] 
    public async Task<IActionResult> GetUserSummary()
    {
        var userId = GetCurrentUserId();
        var statistics = await _statisticsService.GetUserStatisticsAsync(userId);
        return Ok(statistics);
    }
}