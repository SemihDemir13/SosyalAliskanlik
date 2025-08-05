using SosyalAliskanlikApp.Modules.Auth.Application.DTOs;


namespace SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;

public interface IAuthService
{
        Task RegisterUserAsync(RegisterRequestDto request);
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request); 
            


}