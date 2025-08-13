// Dosya: src/Modules/Auth/Auth.Application/Interfaces/IUserService.cs
using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;

namespace SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> SearchUsersAsync(string searchTerm, Guid currentUserId);
}