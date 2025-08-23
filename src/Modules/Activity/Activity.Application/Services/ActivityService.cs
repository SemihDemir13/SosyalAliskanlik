using SosyalAliskanlikApp.Modules.Activity.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Activity.Domain.Enums;
using SosyalAliskanlikApp.Persistence;
using ActivityEntity = SosyalAliskanlikApp.Modules.Activity.Domain.Entities.Activity;
using SosyalAliskanlikApp.Modules.Activity.Application.DTOs;
using Microsoft.EntityFrameworkCore;



namespace SosyalAliskanlikApp.Modules.Activity.Application.Services;

public class ActivityService : IActivityService
{
    private readonly ApplicationDbContext _context;

    public ActivityService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task CreateActivityAsync(Guid userId, ActivityType activityType, string description, Guid? relatedEntityId = null)
    {
        var activity = new ActivityEntity
        {
            UserId = userId,
            ActivityType = activityType,
            Description = description,
            RelatedEntityId = relatedEntityId
        };

        await _context.Activities.AddAsync(activity);

    }
     public async Task<IEnumerable<ActivityDto>> GetActivityFeedAsync(Guid currentUserId)
    {
        // 1. Mevcut kullanıcının arkadaşlarının ID'lerini bul.
        var friendIds = await _context.Friendships
            .Where(f => (f.RequesterId == currentUserId || f.AddresseeId == currentUserId) && f.Status == SosyalAliskanlikApp.Modules.Friends.Domain.Enums.FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == currentUserId ? f.AddresseeId : f.RequesterId)
            .ToListAsync();

        // 2. Arkadaş listesine mevcut kullanıcının kendisini de ekle.
        var userIdsForFeed = new List<Guid>(friendIds) { currentUserId };

        // 3. Bu kullanıcılara ait son 50 aktiviteyi çek.
        var activities = await _context.Activities
            .Include(a => a.User) // Kullanıcı adını alabilmek için User'ı dahil et
            .Where(a => userIdsForFeed.Contains(a.UserId))
            .OrderByDescending(a => a.CreatedAt)
            .Take(50) // Performans için akışı sınırla
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