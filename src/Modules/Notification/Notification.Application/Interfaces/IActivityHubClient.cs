namespace SosyalAliskanlikApp.Modules.Notification.Application.Interfaces;

public interface IActivityHubClient
{
    /// <summary>
    /// Belirtilen kullanıcıya gerçek zamanlı bir bildirim gönderir.
    /// </summary>
    /// <param name="userId">Bildirimi alacak kullanıcının Id'si.</param>
    /// <param name="methodName">Frontend'de dinlenecek olan metodun adı (örneğin, "ReceiveFriendRequest").</param>
    /// <param name="data">Bildirimle birlikte gönderilecek veri (DTO).</param>
    /// <returns>İşlemin başarıyla tamamlandığını belirten bir Task.</returns>
    Task SendNotificationToUserAsync(string userId, string methodName, object data);

    /// <summary>
    /// Belirtilen kullanıcılara gerçek zamanlı bir bildirim gönderir.
    /// </summary>
    /// <param name="userIds">Bildirimi alacak kullanıcıların Id listesi.</param>
    /// <param name="methodName">Frontend'de dinlenecek olan metodun adı (örneğin, "ReceiveNewActivity").</param>
    /// <param name="data">Bildirimle birlikte gönderilecek veri (DTO).</param>
    /// <returns>İşlemin başarıyla tamamlandığını belirten bir Task.</returns>
    Task SendNotificationToUsersAsync(IReadOnlyList<string> userIds, string methodName, object data);
}