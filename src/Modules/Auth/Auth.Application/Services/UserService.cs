// Dosya: src/Modules/Auth/Auth.Application/Services/UserService.cs
using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;
using SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;
using SosyalAliskanlikApp.Persistence;

namespace SosyalAliskanlikApp.Modules.Auth.Application.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> SearchUsersAsync(string searchTerm, Guid currentUserId)
    {
        // Arama terimi boşsa veya çok kısaysa boş liste dön.
        if (string.IsNullOrWhiteSpace(searchTerm) || searchTerm.Length < 2)
        {
            return new List<UserDto>();
        }

        return await _context.Users
            // Kullanıcının kendisini arama sonuçlarından çıkar.
            .Where(u => u.Id != currentUserId && 
                        // Veritabanında küçük/büyük harf duyarsız arama yap.
                        EF.Functions.ILike(u.Name, $"%{searchTerm}%")) 
            .Select(u => new UserDto 
            { 
                Id = u.Id, 
                Name = u.Name 
            })
            .Take(10) // Performans için sonuçları ilk 10 ile sınırla.
            .ToListAsync();
    }
}