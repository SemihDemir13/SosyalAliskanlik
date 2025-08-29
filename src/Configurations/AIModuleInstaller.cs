using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.AI.Application.Interfaces;
using SosyalAliskanlikApp.Modules.AI.Application.Services;
namespace SosyalAliskanlikApp.Configurations;
public static class AIModuleInstaller {
    public static IServiceCollection AddAIModule(this IServiceCollection services) {
        services.AddSingleton<IAIService, AIService>();
        return services;
    }
}