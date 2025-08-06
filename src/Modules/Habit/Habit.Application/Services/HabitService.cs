using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Habit.Application.DTOs;
using SosyalAliskanlikApp.Modules.Habit.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Habit.Domain.Entities; 
using SosyalAliskanlikApp.Persistence; 
using HabitEntity = SosyalAliskanlikApp.Modules.Habit.Domain.Entities.Habit;


namespace SosyalAliskanlikApp.Modules.Habit.Application.Services;

public class HabitService : IHabitService
{
    private readonly ApplicationDbContext _context;

    public HabitService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HabitDto> CreateHabitAsync(CreateHabitRequestDto request, Guid userId)
    {
        var habit = new HabitEntity
        {
            Name = request.Name,
            Description = request.Description,
            UserId = userId // Token'dan gelen kullanıcı ID'si
        };

        await _context.Habits.AddAsync(habit);
        await _context.SaveChangesAsync();

        return new HabitDto
        {
            Id = habit.Id,
            Name = habit.Name,
            Description = habit.Description,
            CreatedAt = habit.CreatedAt
        };
    }

    public async Task<IEnumerable<HabitDto>> GetHabitsByUserIdAsync(Guid userId)
    {
        return await _context.Habits
            .Where(h => h.UserId == userId)
            .Select(h => new HabitDto
            {
                Id = h.Id,
                Name = h.Name,
                Description = h.Description,
                CreatedAt = h.CreatedAt
            })
            .ToListAsync();
    }
    public async Task<HabitDto?> UpdateHabitAsync(Guid habitId, UpdateHabitRequestDto request, Guid userId)
    {
        // 1. Güncellenecek alışkanlığı veritabanından bul.
        var habitToUpdate = await _context.Habits.FindAsync(habitId);

        // 2. Alışkanlık var mı VE bu alışkanlık isteği yapan kullanıcıya mı ait? KONTROL ET.
        if (habitToUpdate == null || habitToUpdate.UserId != userId)
        {
            // Eğer alışkanlık bulunamazsa veya başkasına aitse, null dönerek başarısız olduğunu belirt.
            return null;
        }

        // 3. Bilgileri güncelle.
        habitToUpdate.Name = request.Name;
        habitToUpdate.Description = request.Description;
        habitToUpdate.UpdatedAt = DateTime.UtcNow; // Güncellenme tarihini ayarla

        // 4. Değişiklikleri kaydet.
        await _context.SaveChangesAsync();

        // 5. Güncellenmiş veriyi DTO olarak geri dön.
        return new HabitDto
        {
            Id = habitToUpdate.Id,
            Name = habitToUpdate.Name,
            Description = habitToUpdate.Description,
            CreatedAt = habitToUpdate.CreatedAt
        };
    }

    public async Task<bool> DeleteHabitAsync(Guid habitId, Guid userId)
    {
        //silinecek alışkanlık
        var habitToDelete = await _context.Habits.FindAsync(habitId);

        //kontrol
        if (habitToDelete == null || habitToDelete.UserId != userId)
        {
            return false;
        }

        //sil
        _context.Habits.Remove(habitToDelete);

        //kaydet 
        await _context.SaveChangesAsync();

        return true;

    }

    public async Task<HabitDto?> GetHabitByIdAsync(Guid habitId, Guid userId)
    {   
        //kontrol
        var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

        if (habit == null)
        {
            return null;
        }

        return new HabitDto
        {
            Id = habit.Id,
            Name = habit.Name,
            Description = habit.Description,
            CreatedAt = habit.CreatedAt
        };

        
    }
}