// Dosya: src/Modules/Friends/Application/DTOs/FriendDto.cs
namespace SosyalAliskanlikApp.Modules.Friends.Application.DTOs;

public class FriendDto
{
    public Guid FriendshipId { get; set; } // İlişkinin ID'si (arkadaşlığı silmek için)
    public Guid FriendId { get; set; } // Arkadaşın ID'si
    public required string FriendName { get; set; } // Arkadaşın adı
}