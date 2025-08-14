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

    var foundUsers = await _context.Users
        .Where(u => u.Id != currentUserId && EF.Functions.ILike(u.Name, $"%{searchTerm}%"))
        .Take(10)
        .ToListAsync();

    if (!foundUsers.Any())
    {
        return new List<UserDto>();
    }

    var foundUserIds = foundUsers.Select(u => u.Id).ToList();

    // ToDictionaryAsync yerine, önce listeyi çekip sonra gruplayarak sözlük oluşturalım.
    // Bu, olası mükerrer kayıtlara karşı daha dayanıklıdır.
    var friendships = await _context.Friendships
        .Where(f =>
            (f.RequesterId == currentUserId && foundUserIds.Contains(f.AddresseeId)) ||
            (foundUserIds.Contains(f.RequesterId) && f.AddresseeId == currentUserId)
        )
        .ToListAsync();

    // Her bir arkadaş ID'si için en son (en güncel) ilişki durumunu al.
    var friendshipMap = friendships
        .GroupBy(f => f.RequesterId == currentUserId ? f.AddresseeId : f.RequesterId)
        .ToDictionary(
            g => g.Key, 
            g => g.OrderByDescending(f => f.CreatedAt).First() // En son kaydı al
        );

    var userDtos = foundUsers.Select(u => new UserDto
    {
        Id = u.Id,
        Name = u.Name,
        FriendshipStatus = friendshipMap.ContainsKey(u.Id) ? friendshipMap[u.Id].Status.ToString() : null
    }).ToList();

    return userDtos;
}
}