// Dosya: src/Modules/Messaging/Domain/Entities/Conversation.cs

using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using SosyalAliskanlikApp.Shared.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace SosyalAliskanlikApp.Modules.Messaging.Domain.Entities;

public class Conversation : BaseEntity
{
    public Guid User1Id { get; set; }
    [ForeignKey("User1Id")]
    public virtual User User1 { get; set; } = null!;

    public Guid User2Id { get; set; }
    [ForeignKey("User2Id")]
    public virtual User User2 { get; set; } = null!;

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}