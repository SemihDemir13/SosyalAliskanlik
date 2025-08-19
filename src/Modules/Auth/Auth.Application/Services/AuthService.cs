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
       var baseUrl = _configuration["ApiBaseUrl"];
       var confirmationLink = $"{baseUrl}/auth/confirm-email?userId={newUser.Id}&token={token}"; // DİKKAT: URL'i düzelttim
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
        return Result.Failure("Geçersiz kullanıcı ID'si veya token.");
    }

    if (!Guid.TryParse(userId, out var userGuid))
    {
        return Result.Failure("Kullanıcı ID'si formatı geçersiz.");
    }

    var user = await _context.Users.FindAsync(userGuid);

    if (user == null)
    {
        return Result.Failure("Kullanıcı bulunamadı.");
    }

    // --- HATA AYIKLAMA İÇİN LOGLAMA ---
    Console.WriteLine("--- E-POSTA DOĞRULAMA KONTROLÜ ---");
    Console.WriteLine($"Linkten Gelen Token : '{token}' (Uzunluk: {token.Length})");
    Console.WriteLine($"Veritabanındaki Token: '{user.EmailConfirmationToken}' (Uzunluk: {user.EmailConfirmationToken?.Length})");
    Console.WriteLine($"Token'lar Eşit mi?    : {user.EmailConfirmationToken == token}");
    Console.WriteLine("-----------------------------------");
    // --- BİTTİ ---

    if (user.EmailConfirmationToken != token)
    {
        return Result.Failure("Geçersiz doğrulama token'ı.");
    }

    if (user.ConfirmationTokenExpiry < DateTime.UtcNow)
    {
        return Result.Failure("Doğrulama linkinin süresi dolmuş.");
    }

    user.EmailConfirmed = true;
    user.EmailConfirmationToken = null;
    user.ConfirmationTokenExpiry = null;

    await _context.SaveChangesAsync(); // Update demeye gerek yok, EF Core değişikliği anlar.

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