// Dosya: src/Modules/Friends/Application/DTOs/SendFriendRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace SosyalAliskanlikApp.Modules.Friends.Application.DTOs;

public class SendFriendRequestDto
{
    [Required]
    public Guid AddresseeId { get; set; } // İsteğin gönderileceği kullanıcının ID'si
}