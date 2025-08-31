// Konum: /Modules/Notification/Web/Services/ActivityHubClient.cs

using Microsoft.AspNetCore.SignalR;
using SosyalAliskanlikApp.Modules.Notification.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Notification.Web.Hubs;

namespace SosyalAliskanlikApp.Modules.Notification.Web.Services;

// Bu sınıf, Application katmanındaki arayüzü Web katmanında uygular.
public class ActivityHubClient : IActivityHubClient
{
    private readonly IHubContext<ActivityHub> _hubContext;

    public ActivityHubClient(IHubContext<ActivityHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task SendNotificationToUserAsync(string userId, string methodName, object data)
    {
        return _hubContext.Clients.Group(userId).SendAsync(methodName, data);
    }

    public Task SendNotificationToUsersAsync(IReadOnlyList<string> userIds, string methodName, object data)
    {
        return _hubContext.Clients.Groups(userIds).SendAsync(methodName, data);
    }
}