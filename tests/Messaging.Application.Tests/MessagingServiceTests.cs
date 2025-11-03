// Dosya: tests/Messaging.Application.Tests/MessagingServiceTests.cs

using Moq;
using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Persistence;
using SosyalAliskanlikApp.Modules.Notification.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Messaging.Application.Services;
using SosyalAliskanlikApp.Modules.Messaging.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using FluentAssertions;
using SosyalAliskanlikApp.Modules.Messaging.Application.DTOs;
using SosyalAliskanlikApp.Modules.Messaging.Domain.Entities;

namespace Messaging.Application.Tests;

public class MessagingServiceTests
{
    private readonly Mock<IActivityHubClient> _mockActivityHubClient;
    private readonly ApplicationDbContext _dbContext;
    private readonly IMessagingService _messagingService;

    public MessagingServiceTests()
    {
        // Mock (Taklit) Nesneleri Oluşturma
        _mockActivityHubClient = new Mock<IActivityHubClient>();

        // In-Memory Veritabanı Kurulumu
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Her test sınıfı için farklı bir veritabanı
            .Options;
        _dbContext = new ApplicationDbContext(options);

        // Test Edilecek Servisi Oluşturma
        _messagingService = new MessagingService(_dbContext, _mockActivityHubClient.Object);
    }

    [Fact]
    public async Task SendMessageAsync_ShouldFail_WhenSenderIsSameAsReceiver()
    {
        // Arrange (Hazırlık)
        var userId = Guid.NewGuid();
        var content = "Kendime test mesajı";

        // Act (Eylem)
        var result = await _messagingService.SendMessageAsync(userId, userId, content);

        // Assert (Doğrulama)
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Kendinize mesaj gönderemezsiniz.");
        _dbContext.Messages.Should().BeEmpty();
    }

    [Fact]
    public async Task SendMessageAsync_ShouldCreateNewConversationAndMessage_WhenConversationDoesNotExist()
    {
        // Arrange (Hazırlık)
        var senderId = Guid.NewGuid();
        var receiverId = Guid.NewGuid();
        
        _dbContext.Users.AddRange(
            new User { Id = senderId, Name = "Sender", Email = "sender@test.com", PasswordHash = "dummy_hash_1" }, 
            new User { Id = receiverId, Name = "Receiver", Email = "receiver@test.com", PasswordHash = "dummy_hash_2" }
        );
        await _dbContext.SaveChangesAsync();
        
        var content = "Bu ilk mesaj!";

        // Act (Eylem)
        var result = await _messagingService.SendMessageAsync(senderId, receiverId, content);

        // Assert (Doğrulama)
        
        // 1. Dönen sonucun başarılı olduğunu doğrula
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Content.Should().Be(content);
        result.Value.SenderId.Should().Be(senderId);

        // 2. Veritabanı durumunu doğrula
        var conversations = await _dbContext.Conversations.ToListAsync();
        conversations.Should().HaveCount(1);
        var conversation = conversations.First();
        conversation.User1Id.Should().Be(senderId);
        conversation.User2Id.Should().Be(receiverId);

        var messages = await _dbContext.Messages.ToListAsync();
        messages.Should().HaveCount(1);
        var message = messages.First();
        message.Content.Should().Be(content);
        message.ConversationId.Should().Be(conversation.Id);

        // 3. Mock nesnesinin davranışını doğrula
        _mockActivityHubClient.Verify(
            hub => hub.SendNotificationToUserAsync(
                receiverId.ToString(),
                "ReceiveMessage",
                It.Is<MessageDto>(dto => dto.Id == result.Value.Id)
            ), 
            Times.Once
        );
    }
}