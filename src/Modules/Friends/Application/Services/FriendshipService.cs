// Dosya: src/Modules/Friends/Application/Services/FriendshipService.cs
using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Friends.Application.DTOs;
using SosyalAliskanlikApp.Modules.Friends.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Friends.Domain.Entities;
using SosyalAliskanlikApp.Modules.Friends.Domain.Enums;
using SosyalAliskanlikApp.Persistence;
using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Modules.Notification.Application.Interfaces;


namespace SosyalAliskanlikApp.Modules.Friends.Application.Services;

public class FriendshipService : IFriendshipService
{
   private readonly ApplicationDbContext _context;
    private readonly IActivityHubClient _activityHubClient;

    public FriendshipService(ApplicationDbContext context, IActivityHubClient activityHubClient)
    {
        _context = context;
        _activityHubClient = activityHubClient;
    }

    public async Task<Result> AcceptRequestAsync(Guid friendshipId, Guid userId)
    {
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f => f.Id == friendshipId && f.AddresseeId == userId && f.Status == FriendshipStatus.Pending);

        if (friendship == null)
        {
            return Result.Failure("Arkadaşlık isteği bulunamadı veya bu isteği yanıtlama yetkiniz yok.");
        }

        friendship.Status = FriendshipStatus.Accepted;
        friendship.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> DeclineRequestAsync(Guid friendshipId, Guid userId)
    {
        {
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => f.Id == friendshipId && f.AddresseeId == userId && f.Status == FriendshipStatus.Pending);

            if (friendship == null)
            {
                return Result.Failure("Arkadaşlık isteği bulunamadı veya bu isteği yanıtlama yetkiniz yok.");
            }

            friendship.Status = FriendshipStatus.Declined;
            friendship.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Result.Success();
        }
    }

    public async Task<Result<List<FriendRequestDto>>> GetPendingRequestsAsync(Guid userId)
    {
          var requests = await _context.Friendships
            .Where(f => f.AddresseeId == userId && f.Status == FriendshipStatus.Pending)
            .Include(f => f.Requester) 
            .Select(f => new FriendRequestDto
        {
            FriendshipId = f.Id,
            RequesterId = f.RequesterId,
            RequesterName = f.Requester.Name, 
            RequestedAt = f.CreatedAt

        })
         .ToListAsync();

        return Result.Success(requests);
    }

    public async Task<Result> SendRequestAsync(SendFriendRequestDto request, Guid requesterId)
{
    if (requesterId == request.AddresseeId)
    {
        return Result.Failure("Kendinize arkadaşlık isteği gönderemezsiniz.");
    }

    var addresseeExists = await _context.Users.AnyAsync(u => u.Id == request.AddresseeId);
    if (!addresseeExists)
    {
        return Result.Failure("İstek gönderilecek kullanıcı bulunamadı.");
    }

    // İki kullanıcı arasındaki ilişkiyi, yönüne bakmaksızın bul.
    var friendship = await _context.Friendships
        .FirstOrDefaultAsync(f => 
            (f.RequesterId == requesterId && f.AddresseeId == request.AddresseeId) ||
            (f.RequesterId == request.AddresseeId && f.AddresseeId == requesterId));

    if (friendship != null)
    {
        
        switch (friendship.Status)
        {
            case FriendshipStatus.Accepted:
                return Result.Failure("Bu kullanıcıyla zaten arkadaşsınız.");
            case FriendshipStatus.Pending:
                // İsteği kimin gönderdiğini kontrol et. Eğer ben göndermemişsem, isteği kabul etmem beklenir.
                if (friendship.RequesterId == requesterId)
                    return Result.Failure("Bu kullanıcıya zaten bir istek gönderdiniz.");
                else
                    return Result.Failure("Bu kullanıcı size zaten bir istek göndermiş. Lütfen isteklerinizi kontrol edin.");
            case FriendshipStatus.Blocked:
                return Result.Failure("Bu kullanıcıya istek gönderemezsiniz veya bu kullanıcı tarafından engellendiniz.");
            
            case FriendshipStatus.Declined:
                // Eğer daha önce reddedilmişse, mevcut kaydı YENİDEN AKTİF HALE GETİR.
                // İsteği bu sefer kimin gönderdiğine göre Requester/Addressee rollerini güncelle.
                friendship.RequesterId = requesterId;
                friendship.AddresseeId = request.AddresseeId;
                friendship.Status = FriendshipStatus.Pending;
                friendship.CreatedAt = DateTime.UtcNow; 
                friendship.UpdatedAt = null;
                break; 
        }
    }
    else
    {
        
        friendship = new Friendship
        {
            RequesterId = requesterId,
            AddresseeId = request.AddresseeId,
            Status = FriendshipStatus.Pending
        };
        await _context.Friendships.AddAsync(friendship);
    }
    
    
  await _context.SaveChangesAsync();

        // ADIM 3: BİLDİRİM GÖNDERME KODU
        // Veritabanı işlemi başarılı olduktan sonra, isteği alan kullanıcıya bildirim gönder.
        var requester = await _context.Users.FindAsync(requesterId);
        if (requester != null)
        {
            var notificationData = new 
            {
                FriendshipId = friendship.Id,
                RequesterId = requesterId,
                RequesterName = requester.Name,
                RequestedAt = friendship.CreatedAt
            };

            await _activityHubClient.SendNotificationToUserAsync(
                request.AddresseeId.ToString(), 
                "ReceiveFriendRequest",         
                notificationData              
            );
        }
        
        return Result.Success();
    }
    public async Task<Result<List<FriendDto>>> GetFriendsAsync(Guid userId)
    {
        var friendsDto = await _context.Friendships
            .Where(f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == FriendshipStatus.Accepted)
            // İLİŞKİLİ USER NESNELERİNİ SORGUNUN BAŞINDA ÇEKİYORUZ
            .Include(f => f.Requester)
            .Include(f => f.Addressee)
            // DTO'ya dönüştürme işlemini doğrudan veritabanı sorgusunda yapıyoruz
            .Select(f => new FriendDto
            {
                FriendshipId = f.Id,
                FriendId = f.RequesterId == userId ? f.AddresseeId : f.RequesterId,
                FriendName = f.RequesterId == userId ? f.Addressee.Name : f.Requester.Name
            })
            .ToListAsync();

        return Result.Success(friendsDto);
    }
     public async Task<Result> RemoveFriendAsync(Guid friendshipId, Guid currentUserId)
    {
        // 1. Silinecek arkadaşlık ilişkisini bul.
        var friendship = await _context.Friendships.FindAsync(friendshipId);

        if (friendship == null)
        {
            return Result.Failure("Arkadaşlık kaydı bulunamadı.");
        }

        // 2. Güvenlik Kontrolü: Bu işlemi yapmaya çalışan kişi, bu arkadaşlığın taraflarından biri mi?
        if (friendship.RequesterId != currentUserId && friendship.AddresseeId != currentUserId)
        {
            return Result.Failure("Bu işlemi yapma yetkiniz yok.");
        }
        
        // 3. Durumun "Kabul Edilmiş" olduğundan emin ol. (İsteğe bağlı ama iyi bir kontrol)
        if (friendship.Status != FriendshipStatus.Accepted)
        {
            return Result.Failure("Bu kayıt, onaylanmış bir arkadaşlık değildir.");
        }

        // 4. Kaydı sil.
        _context.Friendships.Remove(friendship);
        await _context.SaveChangesAsync();

        return Result.Success();
    }
}