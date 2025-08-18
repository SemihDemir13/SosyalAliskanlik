using Microsoft.AspNetCore.Mvc;
using SosyalAliskanlikApp.Modules.Auth.Application.Interfaces; // Bu satırı ekleyin
using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;
using Microsoft.AspNetCore.Authorization; // Bu using ifadesini en üste eklediğinden emin ol
using System.Security.Claims; 

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
        var result = await _authService.RegisterUserAsync(request);

        if (result.IsFailure)
        {
            // Servis bir hata döndürdüyse, 400 Bad Request ve hata mesajını dön.
            return BadRequest(new { message = result.Error });
        }

        // Başarılı ise 200 OK dön.
        return Ok(new { message = "User registered successfully!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);

        if (result.IsFailure)
        {
            // Servis bir hata döndürdüyse, bu sefer 401 Unauthorized dönelim.
            return Unauthorized(new { message = result.Error });
        }

        // Başarılı ise 200 OK ve token'ı dön.
        return Ok(result.Value);
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        var result = await _authService.ConfirmEmailAsync(userId, token);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.Error });
        }

        // You can redirect to a confirmation success page on your frontend
        return Ok(new { message = "Email confirmed successfully!" });
    }

     [HttpGet("profile")]
    [Authorize] // Bu endpoint'e sadece geçerli bir token ile erişilebilir.
    public IActionResult GetProfile()
    {
        // [Authorize] attribute'ü sayesinde, bu metoda gelindiğinde
        // User nesnesinin içi token'dan gelen bilgilerle doldurulmuş olur.

        // Token'ın içindeki 'sub' (subject) claim'inden kullanıcı ID'sini oku.
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Eğer bir sebepten ötürü token'da ID bulunamazsa (çok nadir), hata dön.
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        
        // Diğer bilgileri de oku.
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        var userName = User.FindFirstValue("name"); // Bu, token'ı oluştururken eklediğimiz özel claim.

        // Okunan bilgileri anonim bir nesne olarak frontend'e dön.
        return Ok(new 
        { 
            Id = userId, 
            Email = userEmail, 
            Name = userName 
        });
    }
    
}