using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.Habit.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Habit.Application.Services;

namespace SosyalAliskanlikApp.Configurations;

public static class HabitModuleInstaller
{
    public static IServiceCollection AddHabitModule(this IServiceCollection services)
    {
        services.AddScoped<IHabitService, HabitService>();
        return services;
    }
}