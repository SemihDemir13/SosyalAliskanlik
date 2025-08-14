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
        if (string.IsNullOrWhiteSpace(searchTerm) || searchTerm.Length < 2)
        {
            return new List<UserDto>();
        }

        // 1. Arama terimine uyan kullanıcıları bul.
        var foundUsers = await _context.Users
            .Where(u => u.Id != currentUserId && EF.Functions.ILike(u.Name, $"%{searchTerm}%"))
            .Take(10)
            .ToListAsync();

        if (!foundUsers.Any())
        {
            return new List<UserDto>();
        }

        var foundUserIds = foundUsers.Select(u => u.Id).ToList();

        // 2. Bu bulunan kullanıcılar ile mevcut kullanıcı arasındaki TÜM arkadaşlık ilişkilerini çek.
        var friendships = await _context.Friendships
            .Where(f =>
                (f.RequesterId == currentUserId && foundUserIds.Contains(f.AddresseeId)) ||
                (foundUserIds.Contains(f.RequesterId) && f.AddresseeId == currentUserId)
            )
            .ToDictionaryAsync(f => f.RequesterId == currentUserId ? f.AddresseeId : f.RequesterId);
        // Sonucu, arkadaşın ID'sini anahtar olarak kullanan bir sözlüğe çeviriyoruz. Bu, daha sonra hızlı erişim sağlar.

        // 3. Sonucu, arkadaşlık durumuyla birlikte DTO'ya dönüştür.
        var userDtos = foundUsers.Select(u => new UserDto
        {
            Id = u.Id,
            Name = u.Name,
            // Eğer bu kullanıcı için bir arkadaşlık kaydı varsa, durumunu string'e çevir. Yoksa null bırak.
            FriendshipStatus = friendships.ContainsKey(u.Id) ? friendships[u.Id].Status.ToString() : null
        }).ToList();

        return userDtos;
    }
}