// Dosya: src/Modules/Friends/Domain/Entities/Friendship.cs
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Modules.Friends.Domain.Enums;
using SosyalAliskanlikApp.Shared;
using SosyalAliskanlikApp.Shared.Entities;


namespace SosyalAliskanlikApp.Modules.Friends.Domain.Entities;

public class Friendship : BaseEntity
{
    // İsteği gönderen kullanıcı
    public Guid RequesterId { get; set; }
    public  User Requester { get; set; } = null!;

    // İsteği alan kullanıcı
    public Guid AddresseeId { get; set; }
    public  User Addressee { get; set; } = null!;

    // Arkadaşlık durumunu gösteren alan
    public FriendshipStatus Status { get; set; }
}