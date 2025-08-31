using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.Notification.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Notification.Web.Services;

namespace SosyalAliskanlikApp.Configurations;

public static class NotificationModuleInstaller
{
    public static IServiceCollection AddNotificationModule(this IServiceCollection services)
    {
    
        services.AddScoped<IActivityHubClient, ActivityHubClient>();

        return services;
    }
}