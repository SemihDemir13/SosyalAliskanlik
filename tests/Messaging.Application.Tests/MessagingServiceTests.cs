// Dosya: tests/Messaging.Application.Tests/MessagingServiceTests.cs

using Moq;
using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Persistence;
using SosyalAliskanlikApp.Modules.Notification.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Messaging.Application.Services;
using SosyalAliskanlikApp.Modules.Messaging.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Auth.Domain.Entities;
using FluentAssertions; 


namespace Messaging.Application.Tests;

public class MessagingServiceTests
{
    private readonly Mock<IActivityHubClient> _mockActivityHubClient;
    private readonly ApplicationDbContext _dbContext;
    private readonly IMessagingService _messagingService;

    public MessagingServiceTests()
    {
        _mockActivityHubClient = new Mock<IActivityHubClient>();

        // izole bir veritabanı ortamı , gerçek değil
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


    private void SeedDatabaseWithUsers()
    {
        if (!_dbContext.Users.Any())
        {
            var users = new List<User>
            {
                new User { Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), Name = "User A", Email = "a@test.com", PasswordHash = "..." },
                new User { Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), Name = "User B", Email = "b@test.com", PasswordHash = "..." }
            };
            _dbContext.Users.AddRange(users);
            _dbContext.SaveChanges();
        }
    }
}