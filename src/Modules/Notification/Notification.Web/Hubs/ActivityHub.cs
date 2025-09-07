using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Notification.Web.Hubs;


[Authorize]
public class ActivityHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrEmpty(userId))
        {
            // Kullanıcıyı, kendi Id'sine sahip özel bir gruba ekleme
            // Bu sayede daha sonra "sadece bu kullanıcıya" mesaj gönderme
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }

        await base.OnConnectedAsync();
    }

    // Bir kullanıcının bağlantısı kesildiğinde bu metot otomatik olarak çalışır.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrEmpty(userId))
        {
            // Bağlantı kesildiğinde kullanıcıyı gruptan çıkarıyoruz.
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
        }
        
        await base.OnDisconnectedAsync(exception);
    }
}