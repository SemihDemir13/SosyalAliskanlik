// Dosya: src/Modules/Messaging/Domain/Entities/Message.cs

using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Shared.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace SosyalAliskanlikApp.Modules.Messaging.Domain.Entities;

public class Message : BaseEntity
{
    // Mesajın ait olduğu konuşma
    public Guid ConversationId { get; set; }
    public virtual Conversation Conversation { get; set; } = null!;

    // Mesajı gönderen kullanıcı
    public Guid SenderId { get; set; }
    [ForeignKey("SenderId")]
    public virtual User Sender { get; set; } = null!;

    public required string Content { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime? ReadAt { get; set; }
}