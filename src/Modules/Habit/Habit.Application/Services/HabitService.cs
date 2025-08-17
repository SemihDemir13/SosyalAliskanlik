using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Friends.Domain.Enums;
using SosyalAliskanlikApp.Modules.Habit.Application.DTOs;
using SosyalAliskanlikApp.Modules.Habit.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Habit.Domain.Entities; 
using SosyalAliskanlikApp.Persistence;
using SosyalAliskanlikApp.Shared;
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
    // 1. Veritabanından, belirli bir kullanıcıya ait olan tüm alışkanlıkları çekiyoruz.
    // .Include() komutu sayesinde, her bir alışkanlıkla birlikte ona bağlı olan
    // TÜM HabitCompletion kayıtlarını da tek bir sorguyla verimli bir şekilde getiriyoruz.
    var habitsFromDb = await _context.Habits
        .Where(h => h.UserId == userId)
        .Include(h => h.HabitCompletions)
        .ToListAsync();

    // 2. Veritabanından gelen bu ham veriyi, frontend'in ihtiyaç duyduğu,
    // hesaplanmış istatistikleri de içeren DTO'lara dönüştürüyoruz.
    var resultDtos = habitsFromDb.Select(habit =>
    {
        // Her alışkanlık için tamamlama tarihlerini ayrı bir listeye alalım.
        var completionDates = habit.HabitCompletions
                                    .Select(completion => completion.CompletionDate)
                                    .ToList();

        // Son 7 gündeki tamamlanma sayısını hesapla.
        var completionsLastWeek = completionDates.Count(date => date > DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7)));

        // Mevcut seriyi (streak) hesaplamak için yardımcı metodu çağır.
        var currentStreak = CalculateStreak(completionDates);

        // Frontend'e göndereceğimiz DTO nesnesini oluştur.
        return new HabitDto
        {
            Id = habit.Id,
            Name = habit.Name,
            Description = habit.Description,
            CreatedAt = habit.CreatedAt,
            Completions = completionDates,
            CompletionsLastWeek = completionsLastWeek,
            CurrentStreak = currentStreak
        };
    });

    return resultDtos;
}

// Bu yardımcı metot, bir alışkanlığın tamamlanma tarihlerini alıp
// mevcut serisini (streak) hesaplar.
private int CalculateStreak(List<DateOnly> dates)
{
    // Eğer hiç tamamlama kaydı yoksa, seri 0'dır.
    if (dates == null || !dates.Any())
    {
        return 0;
    }

    // Tarihleri en yeniden en eskiye doğru sırala.
    var sortedDates = dates.OrderByDescending(d => d).ToList();
    
    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var yesterday = today.AddDays(-1);

    // En son tamamlanan gün, dünden daha eskiyse, seri bozulmuştur.
    if (sortedDates.First() < yesterday)
    {
        return 0;
    }

    int streak = 0;
    // Seriyi saymaya başlayacağımız tarih, ya bugündür ya da dündür.
    var currentDate = sortedDates.Contains(today) ? today : yesterday;
    
    // Geçmişe doğru, tarihler listede olduğu sürece sayacı artır.
    while (sortedDates.Contains(currentDate))
    {
        streak++;
        currentDate = currentDate.AddDays(-1);
    }
    
    return streak;
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

    public async Task<Result<UserHabitSummaryDto?>> GetUserHabitSummaryAsync(Guid targetUserId, Guid currentUserId)
    {
        var areFriends = await _context.Friendships
            .AnyAsync(f =>
                f.Status == FriendshipStatus.Accepted &&
                ((f.RequesterId == currentUserId && f.AddresseeId == targetUserId) ||
                 (f.RequesterId == targetUserId && f.AddresseeId == currentUserId)));

        if (!areFriends)
        {
            // Arkadaş değillerse, yetkileri yok. Hata dönebiliriz veya null.
            // Null dönmek, "bulunamadı" gibi davranarak daha güvenli olabilir.
            return Result.Success<UserHabitSummaryDto?>(null);
        }

        var targetUser = await _context.Users.FindAsync(targetUserId);
        if (targetUser == null)
        {
            return Result.Success<UserHabitSummaryDto?>(null); // Kullanıcı bulunamadı
        }

        var sevenDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));

        var habitsWithSummary = await _context.Habits
            .Where(h => h.UserId == targetUserId)
            .Select(h => new HabitSummaryDto
            {
                Id = h.Id,
                Name = h.Name,
                CompletionsLastWeek = h.HabitCompletions
                                        .Count(hc => hc.CompletionDate >= sevenDaysAgo)
            })
            .ToListAsync();
        
         var resultDto = new UserHabitSummaryDto
        {
            UserName = targetUser.Name,
            Habits = habitsWithSummary
        };

        return Result.Success<UserHabitSummaryDto?>(resultDto);
    }
}