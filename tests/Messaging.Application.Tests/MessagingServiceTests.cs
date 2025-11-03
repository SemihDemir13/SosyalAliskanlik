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
        _mockActivityHubClient = new Mock<IActivityHubClient>();

        // geçici db
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) 
            .Options;
        _dbContext = new ApplicationDbContext(options);

        _messagingService = new MessagingService(_dbContext, _mockActivityHubClient.Object);
    }

    [Fact]
    public async Task SendMessageAsync_ShouldFail_WhenSenderIsSameAsReceiver()
    {
        var userId = Guid.NewGuid();
        var content = "Kendime test mesajı";

        var result = await _messagingService.SendMessageAsync(userId, userId, content);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Kendinize mesaj gönderemezsiniz.");
        _dbContext.Messages.Should().BeEmpty();
    }

    [Fact]
    public async Task SendMessageAsync_ShouldCreateNewConversationAndMessage_WhenConversationDoesNotExist()
    {
        var senderId = Guid.NewGuid();
        var receiverId = Guid.NewGuid();

        _dbContext.Users.AddRange(
            new User { Id = senderId, Name = "Sender", Email = "sender@test.com", PasswordHash = "dummy_hash_1" },
            new User { Id = receiverId, Name = "Receiver", Email = "receiver@test.com", PasswordHash = "dummy_hash_2" }
        );
        await _dbContext.SaveChangesAsync();

        var content = "Bu ilk mesaj!";

        var result = await _messagingService.SendMessageAsync(senderId, receiverId, content);


        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Content.Should().Be(content);
        result.Value.SenderId.Should().Be(senderId);

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

        _mockActivityHubClient.Verify(
            hub => hub.SendNotificationToUserAsync(
                receiverId.ToString(),
                "ReceiveMessage",
                It.Is<MessageDto>(dto => dto.Id == result.Value.Id)
            ),
            Times.Once
        );
    }

    //daha önce konuşma var mı 
    [Fact]
    public async Task SendMessageAsync_ShouldUseExistingConversation_WhenOneAlreadyExists()
    {
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();

         var existingConversation = new Conversation { User1Id = user1Id, User2Id = user2Id };
        _dbContext.Users.AddRange(
            new User { Id = user1Id, Name = "User 1", Email = "user1@test.com", PasswordHash = "hash1" },
            new User { Id = user2Id, Name = "User 2", Email = "user2@test.com", PasswordHash = "hash2" }
        );
         _dbContext.Conversations.Add(existingConversation);
        await _dbContext.SaveChangesAsync();

        var content = "İkinci mesaj!";
        var result = await _messagingService.SendMessageAsync(user1Id, user2Id, content); //ikinci bir mesaj

       result.IsSuccess.Should().BeTrue();
      result.Value.Should().NotBeNull();

        _dbContext.Conversations.Should().HaveCount(1);
     
     var messages = await _dbContext.Messages.Where(m => m.ConversationId == existingConversation.Id).ToListAsync();
        messages.Should().HaveCount(1);
        messages.First().Content.Should().Be(content);

        // Bildirim hala gönderilmeli.
        _mockActivityHubClient.Verify(
            hub => hub.SendNotificationToUserAsync(user2Id.ToString(), "ReceiveMessage", It.IsAny<MessageDto>()),
            Times.Once
        );


    }
}