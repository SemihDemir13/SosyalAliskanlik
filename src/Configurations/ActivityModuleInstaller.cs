using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.Activity.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Activity.Application.Services;

namespace SosyalAliskanlikApp.Configurations;

public static class ActivityModuleInstaller
{
    public static IServiceCollection AddActivityModule(this IServiceCollection services)
    {
        services.AddScoped<IActivityService, ActivityService>();
        
        return services;
    }
}