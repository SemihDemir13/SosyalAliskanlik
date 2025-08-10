using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;
using SosyalAliskanlikApp.Shared;


namespace SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;

public interface IAuthService
{
         Task<Result> RegisterUserAsync(RegisterRequestDto request); 
         Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request); 
            


}