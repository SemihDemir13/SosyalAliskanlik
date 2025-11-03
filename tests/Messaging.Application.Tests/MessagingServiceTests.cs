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
    [Fact]
    public async Task GetConversationsAsync_ShouldReturnCorrectDto_WithUnreadCountAndLastMessage()
    {
        var currentUser = new User { Id = Guid.NewGuid(), Name = "Current User", Email = "current@test.com", PasswordHash = "hash" };
        var otherUser1 = new User { Id = Guid.NewGuid(), Name = "Other User 1", Email = "other1@test.com", PasswordHash = "hash" };
        var otherUser2 = new User { Id = Guid.NewGuid(), Name = "Other User 2", Email = "other2@test.com", PasswordHash = "hash" };

        var conv1 = new Conversation { User1 = currentUser, User2 = otherUser1 };
        var conv2 = new Conversation { User1 = otherUser2, User2 = currentUser };

        // Konuşma 1'e mesajlar ekle (1'i okunmamış)
        conv1.Messages.Add(new Message { Sender = currentUser, Content = "Merhaba" });
        conv1.Messages.Add(new Message { Sender = otherUser1, Content = "Selam, naber?", IsRead = false }); // Okunmamış

        // Konuşma 2'ye mesajlar ekle (hepsi okunmuş)
        conv2.Messages.Add(new Message { Sender = otherUser2, Content = "Test", IsRead = true });

        _dbContext.Users.AddRange(currentUser, otherUser1, otherUser2);
        _dbContext.Conversations.AddRange(conv1, conv2);
        await _dbContext.SaveChangesAsync();

        var result = await _messagingService.GetConversationsAsync(currentUser.Id);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);

        // Konuşma 1'i kontrol 
        var resultConv1 = result.Value.FirstOrDefault(c => c.OtherUserId == otherUser1.Id);
        resultConv1.Should().NotBeNull();
        resultConv1!.OtherUserName.Should().Be("Other User 1");
        resultConv1.LastMessage.Should().Be("Selam, naber?");
        resultConv1.UnreadCount.Should().Be(1);

        // Konuşma 2'yi kontrol 
        var resultConv2 = result.Value.FirstOrDefault(c => c.OtherUserId == otherUser2.Id);
        resultConv2.Should().NotBeNull();
        resultConv2!.OtherUserName.Should().Be("Other User 2");
        resultConv2.LastMessage.Should().Be("Test");
        resultConv2.UnreadCount.Should().Be(0);
    }
  [Fact]
public async Task MarkAsReadAsync_ShouldOnlyMarkOtherUsersMessagesAsRead()
{
    var currentUser = new User { Id = Guid.NewGuid(), Name = "Current User", Email = "current@test.com", PasswordHash = "hash" };
    var otherUser = new User { Id = Guid.NewGuid(), Name = "Other User", Email = "other@test.com", PasswordHash = "hash" };
    var conversation = new Conversation { User1 = currentUser, User2 = otherUser };

    var messageFromOther = new Message { Sender = otherUser, Content = "Okunmamış mesaj", IsRead = false };
    var messageFromSelf = new Message { Sender = currentUser, Content = "Benim mesajım", IsRead = false }; // Kendi mesajımız da okunmamış olabilir
    
    conversation.Messages.Add(messageFromOther);
    conversation.Messages.Add(messageFromSelf);

    _dbContext.Users.AddRange(currentUser, otherUser);
    _dbContext.Conversations.Add(conversation);
    await _dbContext.SaveChangesAsync();

    var result = await _messagingService.MarkAsReadAsync(conversation.Id, currentUser.Id);

    result.IsSuccess.Should().BeTrue();

    var updatedMessageFromOther = await _dbContext.Messages.FindAsync(messageFromOther.Id);
    updatedMessageFromOther!.IsRead.Should().BeTrue(); 

    var updatedMessageFromSelf = await _dbContext.Messages.FindAsync(messageFromSelf.Id);
    updatedMessageFromSelf!.IsRead.Should().BeFalse(); 
 }
}