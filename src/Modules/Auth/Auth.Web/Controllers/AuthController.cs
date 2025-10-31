// Dosya: src/Modules/Auth/Web/Controllers/AuthController.cs

using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; 
using Microsoft.Extensions.Logging;

namespace SosyalAliskanlikApp.Modules.Auth.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        _logger.LogInformation("Yeni kullanıcı kaydı deneniyor: Email {Email}", request.Email);

        var result = await _authService.RegisterUserAsync(request);

        if (result.IsFailure)
        {
            _logger.LogWarning("Kayıt denemesi başarısız: Email {Email}, Hata: {Error}", request.Email, result.Error);
            return BadRequest(new { message = result.Error });
        }

        _logger.LogInformation("Yeni kullanıcı başarıyla kaydedildi: Email {Email}", request.Email);
        return Ok(new { message = "User registered successfully!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        _logger.LogInformation("Giriş denemesi yapılıyor: Email {Email}", request.Email);

        var result = await _authService.LoginAsync(request);

        if (result.IsFailure)
        {
            _logger.LogWarning("Başarısız giriş denemesi: Email {Email}, Sebep: {Error}", request.Email, result.Error);
            return Unauthorized(new { message = result.Error });
        }

        _logger.LogInformation("Kullanıcı başarıyla giriş yaptı: Email {Email}", request.Email);
        return Ok(result.Value);
    }

    [HttpGet("profile")]
    [Authorize]
    public IActionResult GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            // Bu durum normalde [Authorize] yüzünden pek olası değil, ama olursa önemli bir hatadır.
            _logger.LogError("Yetkilendirilmiş bir istekte kullanıcı ID'si (sub claim) bulunamadı.");
            return Unauthorized();
        }

        // LOG: Profil bilgisi getirme işlemini logla
        _logger.LogInformation("Kullanıcı {UserId} için profil bilgileri getiriliyor.", userId);
        
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        var userName = User.FindFirstValue("name");

        _logger.LogInformation("Kullanıcı {UserId} için profil bilgileri başarıyla getirildi.", userId);
        return Ok(new 
        { 
            Id = userId, 
            Email = userEmail, 
            Name = userName 
        });
    }
}