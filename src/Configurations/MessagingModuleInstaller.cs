// Dosya: src/Configurations/MessagingModuleInstaller.cs
using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.Messaging.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Messaging.Application.Services;

namespace SosyalAliskanlikApp.Configurations;

public static class MessagingModuleInstaller
{
    public static IServiceCollection AddMessagingModule(this IServiceCollection services)
    {
        services.AddScoped<IMessagingService, MessagingService>();
        return services;
    }
}