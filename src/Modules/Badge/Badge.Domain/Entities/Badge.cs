using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Shared.Entities;

namespace SosyalAliskanlikApp.Modules.Badge.Domain.Entities;

public class Badge : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string IconUrl { get; set; } 
    public required string Code { get; set; } // Rozeti programatik olarak tanımak için benzersiz bir kod (örn: STREAK_7_DAYS)
}