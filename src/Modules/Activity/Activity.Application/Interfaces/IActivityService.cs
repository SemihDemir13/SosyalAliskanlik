using SosyalAliskanlikApp.Modules.Activity.Application.DTOs;
using SosyalAliskanlikApp.Modules.Activity.Domain.Enums;

namespace SosyalAliskanlikApp.Modules.Activity.Application.Interfaces;

public interface IActivityService
{
    Task CreateActivityAsync(Guid userId, ActivityType activityType, string description, Guid? relatedEntityId = null);
    Task<IEnumerable<ActivityDto>> GetActivityFeedAsync(Guid currentUserId);
}
