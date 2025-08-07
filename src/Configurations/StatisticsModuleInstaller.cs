using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.Statistics.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Statistics.Application.Services;

namespace SosyalAliskanlikApp.Configurations;

public static class StatisticsModuleInstaller
{
    public static IServiceCollection AddStatisticsModule(this IServiceCollection services)
    {
        services.AddScoped<IStatisticsService, StatisticsService>();
        return services;
    }
}