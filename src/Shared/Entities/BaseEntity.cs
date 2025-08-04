 namespace SosyalAliskanlikApp.Shared.Entities;

 public abstract class BaseEntity
 {
     // Tüm tablolar için standart birincil anahtar (Primary Key).
     public Guid Id { get; set; } = Guid.NewGuid();

     // Kaydın ne zaman oluşturulduğunu tutar.
     public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

     // Kaydın ne zaman güncellendiğini tutar (opsiyonel).
     public DateTime? UpdatedAt { get; set; }
 }
