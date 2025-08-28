// Dosya: src/Modules/Badge/Badge.Domain/Entities/UserBadge.cs

using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Shared.Entities;
using HabitEntity = SosyalAliskanlikApp.Modules.Habit.Domain.Entities.Habit;

namespace SosyalAliskanlikApp.Modules.Badge.Domain.Entities;

public class UserBadge : BaseEntity
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public Guid BadgeId { get; set; }
    public virtual Badge Badge { get; set; } = null!;

    public Guid? RelatedHabitId { get; set; }
    
   
    public virtual HabitEntity? RelatedHabit { get; set; } 
}