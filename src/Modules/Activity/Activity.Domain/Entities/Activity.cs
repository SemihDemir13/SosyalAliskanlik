using SosyalAliskanlikApp.Modules.Activity.Domain.Enums;
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Shared.Entities;

namespace SosyalAliskanlikApp.Modules.Activity.Domain.Entities;

public class Activity : BaseEntity
{
    // Eylemi yapan kullanıcı
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    // Eylemin türü
    public ActivityType ActivityType { get; set; }


    public required string Description { get; set; }
    
    // Eylemin ilgili olduğu başka bir entity olabilir örn: tamamlanan Habit'in ID'si
    public Guid? RelatedEntityId { get; set; }
}