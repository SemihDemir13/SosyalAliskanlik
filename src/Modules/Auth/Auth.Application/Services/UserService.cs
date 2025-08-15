// Dosya: src/Modules/Auth/Auth.Application/Services/UserService.cs
using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;
using SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;
using SosyalAliskanlikApp.Persistence;
using SosyalAliskanlikApp.Shared;

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
    public async Task<Result> UpdateProfileAsync(Guid userId, UpdateProfileDto request)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            // Bu durumun normalde gerçekleşmemesi gerekir.
            return Result.Failure("Güncellenecek kullanıcı bulunamadı.");
        }

        // Sadece Name alanını güncelle.
        user.Name = request.Name;
        user.UpdatedAt = DateTime.UtcNow; // Güncellenme tarihini ayarla

        await _context.SaveChangesAsync();

        return Result.Success();
    }
    public async Task<Result> UpdatePasswordAsync(Guid userId, UpdatePasswordDto request)
{
    var user = await _context.Users.FindAsync(userId);
    if (user == null)
    {
        return Result.Failure("Kullanıcı bulunamadı.");
    }

    // 1. Mevcut şifre doğru mu diye kontrol et.
    if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
    {
        return Result.Failure("Mevcut şifreniz yanlış.");
    }

    
    // 2. Yeni şifre, mevcut şifreyle aynı mı?
    if (request.CurrentPassword == request.NewPassword)
    {
        return Result.Failure("Yeni şifre, mevcut şifrenizle aynı olamaz.");
    }
    

    // 3. Yeni şifreyi hash'le
    var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

    // 4. Veritabanındaki hash'i yeni hash ile değiştir.
    user.PasswordHash = newPasswordHash;
    user.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return Result.Success();
}
}