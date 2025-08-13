//  .../DTOs/FriendRequestDto.cs
namespace SosyalAliskanlikApp.Modules.Friends.Application.DTOs;

public class FriendRequestDto
{
    public Guid FriendshipId { get; set; } // İsteğin kendi ID'si
    public Guid RequesterId { get; set; }   // İsteği gönderenin ID'si
    public string RequesterName { get; set; } = string.Empty; // İsteği gönderenin adı
    public DateTime RequestedAt { get; set; } // İstek tarihi
}