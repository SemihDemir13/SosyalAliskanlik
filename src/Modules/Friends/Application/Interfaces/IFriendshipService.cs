// Dosya: src/Modules/Friends/Application/Interfaces/IFriendshipService.cs
using SosyalAliskanlikApp.Modules.Friends.Application.DTOs;
using SosyalAliskanlikApp.Shared;

namespace SosyalAliskanlikApp.Modules.Friends.Application.Interfaces;

public interface IFriendshipService
{
    Task<Result> SendRequestAsync(SendFriendRequestDto request, Guid requesterId);
    Task<Result<List<FriendRequestDto>>> GetPendingRequestsAsync(Guid userId);
    Task<Result> AcceptRequestAsync(Guid friendshipId, Guid userId);
    Task<Result> DeclineRequestAsync(Guid friendshipId, Guid userId);
    Task<Result<List<FriendDto>>> GetFriendsAsync(Guid userId);
    Task<Result> RemoveFriendAsync(Guid friendshipId, Guid currentUserId); 
}