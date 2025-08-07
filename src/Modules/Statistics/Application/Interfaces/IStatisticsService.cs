using SosyalAliskanlikApp.Modules.Statistics.Application.DTOs;

namespace SosyalAliskanlikApp.Modules.Statistics.Application.Interfaces;

public interface IStatisticsService
{
    Task<UserStatisticsDto> GetUserStatisticsAsync(Guid userId);
}