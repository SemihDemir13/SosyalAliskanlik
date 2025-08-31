using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace SosyalAliskanlikApp.Modules.Notification.Web.Hubs;

// Bu attribute, sadece kimliği doğrulanmış (giriş yapmış) kullanıcıların
// bu Hub'a bağlanabilmesini sağlar.
[Authorize]
public class ActivityHub : Hub
{
    // Bir kullanıcı bağlandığında bu metot otomatik olarak çalışır.
    public override async Task OnConnectedAsync()
    {
        // Kullanıcının JWT token'ından kimliğini (UserId) alıyoruz.
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrEmpty(userId))
        {
            // Kullanıcıyı, kendi Id'sine sahip özel bir gruba ekliyoruz.
            // Bu sayede daha sonra "sadece bu kullanıcıya" mesaj gönderebiliriz.
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