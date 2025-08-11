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
        .Include(h => h.HabitCompletions) // <-- İLİŞKİLİ VERİYİ ÇEKMEK İÇİN BU ÇOK ÖNEMLİ
        .Select(h => new HabitDto
        {
            Id = h.Id,
            Name = h.Name,
            Description = h.Description,
            CreatedAt = h.CreatedAt,
            // İlişkili HabitCompletions listesini tarihlere çevirip DTO'ya ekle
            Completions = h.HabitCompletions.Select(hc => hc.CompletionDate).ToList()
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

    public async Task<HabitCompletionDto?> MarkHabitAsCompletedAsync(Guid habitId, DateOnly date, Guid userId)
    {
        //kontrol
        var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

        if (habit == null)
        {
            return null; // Alışkanlık bulunamadı veya kullanıcıya ait değil.
        }
        //bu tarihte zaten tamamlanma kaydı var mı kontrolü 
        var existingCompletion = await _context.HabitCompletions
            .FirstOrDefaultAsync(hc => hc.HabitId == habitId && hc.CompletionDate == date);

        if (existingCompletion != null)
        {
            // Zaten işaretlenmişse, mevcut kaydı dön. Hiçbir şey yapma.
            return new HabitCompletionDto { Id = existingCompletion.Id, HabitId = existingCompletion.HabitId, CompletionDate = existingCompletion.CompletionDate };
        }
        
        // 3. Yeni bir tamamlama kaydı oluştur ve veritabanına ekle.
        var newCompletion = new HabitCompletion
        {
            HabitId = habitId,
            CompletionDate = date
        };

        await _context.HabitCompletions.AddAsync(newCompletion);
        await _context.SaveChangesAsync();

        return new HabitCompletionDto { Id = newCompletion.Id, HabitId = newCompletion.HabitId, CompletionDate = newCompletion.CompletionDate };
    }

    public async Task<bool> UnmarkHabitAsCompletedAsync(Guid habitId, DateOnly date, Guid userId)
    {
         // Silme işlemi için önce alışkanlığın kullanıcıya ait olduğunu doğrulamamız gerekmez,
        // çünkü HabitCompletion kaydını sorgularken zaten HabitId üzerinden dolaylı bir kontrol yapmış olacağız.
        var completionToDelete = await _context.HabitCompletions
            .Include(hc => hc.Habit) // Habit'i de sorguya dahil etme
            .FirstOrDefaultAsync(hc => hc.HabitId == habitId && hc.CompletionDate == date && hc.Habit.UserId == userId);

        if (completionToDelete == null)
        {
            return false; 
        }

        _context.HabitCompletions.Remove(completionToDelete);
        await _context.SaveChangesAsync();
        return true;
    }

    public async  Task<IEnumerable<DateOnly>> GetHabitCompletionsAsync(Guid habitId, Guid userId)
    {
          //  alışkanlığın kullanıcıya ait olduğunu doğrula
        var habitExists = await _context.Habits.AnyAsync(h => h.Id == habitId && h.UserId == userId);
        if (!habitExists)
        {
            // Eğer alışkanlık kullanıcıya ait değilse, boş liste
           
            return Enumerable.Empty<DateOnly>();
        }

        return await _context.HabitCompletions
            .Where(hc => hc.HabitId == habitId)
            .Select(hc => hc.CompletionDate)
            .OrderBy(d => d) 
            .ToListAsync();
    }
}