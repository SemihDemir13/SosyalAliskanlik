using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Auth.Application.Interfaces; // Bu satırı ekleyin
using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;

namespace SosyalAliskanlikApp.Modules.Auth.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        await _authService.RegisterUserAsync(request);
        return Ok(new { Message = "kulanıcı kaydı başarılı!" });
    }

    // YENİ EKLENEN ENDPOINT
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}