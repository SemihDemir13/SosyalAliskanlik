// Dosya: src/Modules/Activity/Activity.Application/Services/ActivityService.cs

using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Activity.Application.DTOs;
using SosyalAliskanlikApp.Modules.Activity.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Activity.Domain.Enums;
using SosyalAliskanlikApp.Modules.Friends.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Friends.Domain.Enums;
using SosyalAliskanlikApp.Modules.Notification.Application.Interfaces;
using SosyalAliskanlikApp.Persistence;
using ActivityEntity = SosyalAliskanlikApp.Modules.Activity.Domain.Entities.Activity;

namespace SosyalAliskanlikApp.Modules.Activity.Application.Services;

public class ActivityService : IActivityService
{
    private readonly ApplicationDbContext _context;
    private readonly IFriendshipService _friendshipService;
    private readonly IActivityHubClient _activityHubClient;

    public ActivityService(
        ApplicationDbContext context,
        IFriendshipService friendshipService,
        IActivityHubClient activityHubClient)
    {
        _context = context;
        _friendshipService = friendshipService;
        _activityHubClient = activityHubClient;
    }
    public async Task CreateActivityAsync(Guid userId, ActivityType activityType, string description, Guid? relatedEntityId = null)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
           
            return;
        }

        var activity = new ActivityEntity
        {
            UserId = user.Id,
            User = user,
            Description = description,
            ActivityType = activityType,
            RelatedEntityId = relatedEntityId
        };

        await _context.Activities.AddAsync(activity);
        await _context.SaveChangesAsync();

        var friendsResult = await _friendshipService.GetFriendsAsync(userId);
        
        var userIdsToNotify = new List<string> { userId.ToString() };
        if (friendsResult.IsSuccess && friendsResult.Value != null)
        {
            userIdsToNotify.AddRange(friendsResult.Value.Select(f => f.FriendId.ToString()));
        }

        var activityForNotification = new ActivityDto
        {
            Id = activity.Id,
            Description = activity.Description,
            CreatedAt = activity.CreatedAt,
            UserName = user.Name
        };

        await _activityHubClient.SendNotificationToUsersAsync(
            userIdsToNotify,
            "ReceiveNewActivity",
            activityForNotification // Frontend'e DTO gönderiyoruz
        );
    }

    public async Task<IEnumerable<ActivityDto>> GetActivityFeedAsync(Guid currentUserId)
    {
        var friendIds = await _context.Friendships
            .Where(f => (f.RequesterId == currentUserId || f.AddresseeId == currentUserId) && f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == currentUserId ? f.AddresseeId : f.RequesterId)
            .ToListAsync();

        var userIdsForFeed = new List<Guid>(friendIds) { currentUserId };

        var activities = await _context.Activities
            .Include(a => a.User)
            .Where(a => userIdsForFeed.Contains(a.UserId))
            .OrderByDescending(a => a.CreatedAt) 
            .Take(50)
          
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                Description = a.Description,
                CreatedAt = a.CreatedAt,
                UserName = a.User.Name
            })
            .ToListAsync();

        return activities;
    }
}