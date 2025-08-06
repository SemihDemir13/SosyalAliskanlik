using SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

namespace SosyalAliskanlikApp.Modules.Habit.Application.Interfaces;

public interface IHabitService
{
    Task<HabitDto> CreateHabitAsync(CreateHabitRequestDto request, Guid userId);
    Task<IEnumerable<HabitDto>> GetHabitsByUserIdAsync(Guid userId);

    Task<HabitDto?> UpdateHabitAsync(Guid habitId, UpdateHabitRequestDto request, Guid userId);

    Task<bool> DeleteHabitAsync(Guid habitId, Guid userId);

    Task<HabitDto?> GetHabitByIdAsync(Guid habitId, Guid userId); 
}