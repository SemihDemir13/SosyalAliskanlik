// Dosya: src/Configurations/AuthModuleInstaller.cs
using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.Auth.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Auth.Application.Services;

namespace SosyalAliskanlikApp.Configurations;

public static class AuthModuleInstaller
{
    public static IServiceCollection AddAuthModule(this IServiceCollection services)
    {
        // IAuthService istendiğinde, AuthService sınıfının bir örneğini ver.
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}