using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Shared.Entities;

namespace SosyalAliskanlikApp.Modules.Badge.Domain.Entities;

public class UserBadge : BaseEntity
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public Guid BadgeId { get; set; }
    public virtual Badge Badge { get; set; } = null!;
}