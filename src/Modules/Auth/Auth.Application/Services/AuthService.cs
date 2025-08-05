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

namespace SosyalAliskanlikApp.Modules.Auth.Application.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task RegisterUserAsync(RegisterRequestDto request)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            throw new Exception("This email is already registered.");
        }
        
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newUser = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash
        };

        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid email or password.");
        }

        var token = GenerateJwtToken(user);

        return new LoginResponseDto { AccessToken = token };
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