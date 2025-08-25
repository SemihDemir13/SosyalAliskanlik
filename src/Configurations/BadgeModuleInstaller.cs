using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.Badge.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Badge.Application.Services;

namespace SosyalAliskanlikApp.Configurations;

public static class BadgeModuleInstaller
{
    public static IServiceCollection AddBadgeModule(this IServiceCollection services)
    {
        services.AddScoped<IBadgeService, BadgeService>();
        return services;
    }
}