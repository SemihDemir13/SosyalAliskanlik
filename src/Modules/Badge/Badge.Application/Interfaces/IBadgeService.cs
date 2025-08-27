using SosyalAliskanlikApp.Modules.Badge.Application.DTOs;

namespace SosyalAliskanlikApp.Modules.Badge.Application.Interfaces;

public interface IBadgeService
{
    // Bu metot, bir alışkanlık tamamlandıktan sonra çağrılacak.
    Task CheckAndAwardBadgesAsync(Guid userId, Guid habitId);

    Task<IEnumerable<BadgeDto>> GetUserBadgesAsync(Guid userId);
}