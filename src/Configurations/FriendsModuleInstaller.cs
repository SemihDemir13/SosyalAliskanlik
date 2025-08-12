// Dosya: src/Configurations/FriendsModuleInstaller.cs
using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Modules.Friends.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Friends.Application.Services;

namespace SosyalAliskanlikApp.Configurations;

public static class FriendsModuleInstaller
{
    public static IServiceCollection AddFriendsModule(this IServiceCollection services)
    {
        services.AddScoped<IFriendshipService, FriendshipService>();
        return services;
    }
}