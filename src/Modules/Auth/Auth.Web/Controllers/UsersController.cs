// Dosya: src/Modules/Auth/Web/Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Auth.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Bu endpoint'e sadece giriş yapmış kullanıcılar erişebilir.
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("search")] // Route: GET /api/users/search?term=aranacak_kelime
    public async Task<IActionResult> SearchUsers([FromQuery] string term)
    {
        var users = await _userService.SearchUsersAsync(term, GetCurrentUserId());
        return Ok(users);
    }
}