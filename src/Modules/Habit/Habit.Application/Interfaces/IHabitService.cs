using SosyalAliskanlikApp.Modules.Habit.Application.DTOs;

namespace SosyalAliskanlikApp.Modules.Habit.Application.Interfaces;

public interface IHabitService
{
    Task<HabitDto> CreateHabitAsync(CreateHabitRequestDto request, Guid userId); //oluşturma
    Task<IEnumerable<HabitDto>> GetHabitsByUserIdAsync(Guid userId);//hepsini listeleme

    Task<HabitDto?> UpdateHabitAsync(Guid habitId, UpdateHabitRequestDto request, Guid userId);//güncelleme

    Task<bool> DeleteHabitAsync(Guid habitId, Guid userId);//silme

    Task<HabitDto?> GetHabitByIdAsync(Guid habitId, Guid userId); //birini listeleme

    Task<HabitCompletionDto?> MarkHabitAsCompletedAsync(Guid habitId, DateOnly date, Guid userId); //alışkanlığı tamamlandı işaretleme
    
     Task<bool> UnmarkHabitAsCompletedAsync(Guid habitId, DateOnly date, Guid userId); //yanlışlıkla işaretlenen ,silme

      Task<IEnumerable<DateOnly>> GetHabitCompletionsAsync(Guid habitId, Guid userId); //tamamlanma tarihleri
}