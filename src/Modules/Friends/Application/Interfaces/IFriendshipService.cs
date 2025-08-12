// Dosya: src/Modules/Friends/Application/Interfaces/IFriendshipService.cs
using SosyalAliskanlikApp.Modules.Friends.Application.DTOs;
using SosyalAliskanlikApp.Shared;

namespace SosyalAliskanlikApp.Modules.Friends.Application.Interfaces;

public interface IFriendshipService
{
    Task<Result> SendRequestAsync(SendFriendRequestDto request, Guid requesterId);
}