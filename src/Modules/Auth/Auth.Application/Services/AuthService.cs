using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;
using SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Persistence;
using SosyalAliskanlikApp.Shared;
using System.Security.Cryptography;

namespace SosyalAliskanlikApp.Modules.Auth.Application.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService; // IEmailService enjekte edildi

    public AuthService(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService; // Dependency injection
    }

    public async Task<Result> RegisterUserAsync(RegisterRequestDto request)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return Result.Failure("Bu email'e kayıtlı hesap var.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Token oluşturma
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(64));

        var newUser = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash,
            EmailConfirmationToken = token,
            ConfirmationTokenExpiry = DateTime.UtcNow.AddHours(24) // Token 24 saat geçerli
        };

        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();

        // Doğrulama e-postası gönderme
        var baseUrl = _configuration["ApiBaseUrl"]; // Değeri appsettings'den oku
        var confirmationLink = $"{baseUrl}/api/auth/confirm-email?userId={newUser.Id}&token={token}";
        var emailBody = $"<h1>Hesabınızı Doğrulayın</h1><p>Lütfen <a href='{confirmationLink}'>buraya</a> tıklayarak e-posta adresinizi doğrulayın.</p>";
        
        await _emailService.SendEmailAsync(newUser.Email, "Hesap Doğrulama", emailBody);

        return Result.Success();
    }

    public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Result.Failure<LoginResponseDto>("Yanlış email veya şifre girdiniz.");
        }

        // E-posta doğrulama kontrolü
        if (!user.EmailConfirmed)
        {
            return Result.Failure<LoginResponseDto>("Giriş yapmadan önce lütfen e-posta adresinizi doğrulayın.");
        }

        var token = GenerateJwtToken(user);
        var response = new LoginResponseDto { AccessToken = token };

        return Result.Success(response);
    }

    public async Task<Result> ConfirmEmailAsync(string userId, string token)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
        {
            return Result.Failure("Invalid user ID or token.");
        }

        var user = await _context.Users.FindAsync(Guid.Parse(userId));

        if (user == null)
        {
            return Result.Failure("User not found.");
        }

        if (user.EmailConfirmationToken != token)
        {
            return Result.Failure("Invalid confirmation token.");
        }

        if (user.ConfirmationTokenExpiry < DateTime.UtcNow)
        {
            return Result.Failure("Confirmation token has expired.");
        }

        user.EmailConfirmed = true;
        user.EmailConfirmationToken = null; // Token can be cleared after use
        user.ConfirmationTokenExpiry = null;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", user.Name), // Custom claim
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1), // Token geçerlilik süresi
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}