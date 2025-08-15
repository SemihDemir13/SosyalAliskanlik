// Dosya: src/Modules/Auth/Auth.Application/Interfaces/IUserService.cs
using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;
using SosyalAliskanlikApp.Shared;

namespace SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> SearchUsersAsync(string searchTerm, Guid currentUserId);
    Task<Result> UpdateProfileAsync(Guid userId, UpdateProfileDto request);
     Task<Result> UpdatePasswordAsync(Guid userId, UpdatePasswordDto request); 
}