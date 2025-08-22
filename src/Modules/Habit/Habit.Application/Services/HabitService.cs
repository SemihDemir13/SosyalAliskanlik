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
        // 1. ADIM: Sadece kullanıcının alışkanlıklarını çek. Hiçbir ilişki (Include) yok.
        var userHabits = await _context.Habits
            .Where(h => h.UserId == userId)
            .ToListAsync();

        // Eğer hiç alışkanlık yoksa, hemen boş bir liste dön.
        if (!userHabits.Any())
        {
            return new List<HabitDto>();
        }

        // 2. ADIM: Çektiğimiz alışkanlıkların ID'lerini bir listeye al.
        var habitIds = userHabits.Select(h => h.Id).ToList();

        // 3. ADIM: Bu ID'lere ait TÜM tamamlama kayıtlarını AYRI BİR SORGUDAYLA çek.
        var allCompletions = await _context.HabitCompletions
            .Where(hc => habitIds.Contains(hc.HabitId))
            .ToListAsync();

        // 4. ADIM: Tamamlama kayıtlarını, ait oldukları HabitId'ye göre grupla.
        // Bu, her bir alışkanlığın tamamlamalarına hızlıca erişmemizi sağlar.
        var completionsByHabitId = allCompletions
            .GroupBy(hc => hc.HabitId)
            .ToDictionary(g => g.Key, g => g.Select(hc => hc.CompletionDate).ToList());

        // 5. ADIM: Şimdi, her bir alışkanlık için DTO'yu oluştururken,
        // bu sözlükten kendi tamamlama kayıtlarını al.
        var resultDtos = userHabits.Select(habit =>
        {
            // Bu alışkanlığa ait tamamlama listesini sözlükten al. Eğer yoksa, boş bir liste kullan.
            var completionDates = completionsByHabitId.GetValueOrDefault(habit.Id, new List<DateOnly>());

            var completionsLastWeek = completionDates.Count(d => d > DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7)));
            var currentStreak = CalculateStreak(completionDates);

            return new HabitDto
            {
                Id = habit.Id,
                Name = habit.Name,
                Description = habit.Description,
                CreatedAt = habit.CreatedAt,
                Completions = completionDates, // <-- Artık burası dolu olacak!
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
        // 1. Veritabanından tek bir alışkanlığı, ilişkili tamamlama kayıtlarıyla birlikte çek.
        var habit = await _context.Habits
            .Include(h => h.HabitCompletions) // <-- EKSİK OLAN EN ÖNEMLİ SATIR
            .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

        // 2. Eğer alışkanlık bulunamazsa veya kullanıcıya ait değilse, null dön.
        if (habit == null)
        {
            return null;
        }

        // 3. Artık 'habit.HabitCompletions' dolu olduğu için, hesaplamaları yapabiliriz.
        var completionDates = habit.HabitCompletions.Select(c => c.CompletionDate).ToList();

        return new HabitDto
        {
            Id = habit.Id,
            Name = habit.Name,
            Description = habit.Description,
            CreatedAt = habit.CreatedAt,
            Completions = completionDates, // <-- Artık burası doğru veriyi içerecek
            CompletionsLastWeek = completionDates.Count(d => d > DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7))),
            CurrentStreak = CalculateStreak(completionDates)
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

    public async Task<IEnumerable<DateOnly>> GetHabitCompletionsAsync(Guid habitId, Guid userId)
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
    
  public async Task<Result> ToggleHabitCompletionAsync(string habitId, string userId)
  {
    // Adım 1: Frontend'den gelen string ID'leri Guid'e dönüştür.
    // Bu, hem karşılaştırma hem de atama hatalarını engeller.
    if (!Guid.TryParse(habitId, out var habitGuid) || !Guid.TryParse(userId, out var userGuid))
    {
        return Result.Failure("Geçersiz kimlik formatı.");
    }

    // Adım 2: Alışkanlığı Guid kullanarak bul ve sahibinin doğru kullanıcı olduğunu doğrula.
    // DÜZELTME: Artık Guid'leri karşılaştırıyoruz (string vs Guid hatası çözüldü).
    var habit = await _context.Habits
        .FirstOrDefaultAsync(h => h.Id == habitGuid && h.UserId == userGuid);

    if (habit is null)
    {
        return Result.Failure("Alışkanlık bulunamadı veya bu işlem için yetkiniz yok.");
    }

    // Adım 3: Bugünün tarihini al.
    var today = DateOnly.FromDateTime(DateTime.UtcNow);

    // Adım 4: Bu alışkanlık için bugüne ait bir tamamlama kaydı var mı diye kontrol et.
    // DÜZELTME: 'Date' yerine doğru property adı olan 'CompletionDate' kullanıldı.
    var existingCompletion = await _context.HabitCompletions
        .FirstOrDefaultAsync(c => c.HabitId == habitGuid && c.CompletionDate == today);

    if (existingCompletion is not null)
    {
        // Varsa: Kaydı sil.
        _context.HabitCompletions.Remove(existingCompletion);
    }
    else
    {
        // Yoksa: Yeni bir tamamlama kaydı oluştur.
        var newCompletion = new HabitCompletion
        {
            // DÜZELTME: string yerine Guid atıyoruz.
            HabitId = habitGuid,
            // DÜZELTME: 'Date' yerine doğru property adı olan 'CompletionDate' kullanıldı.
            CompletionDate = today
        };
        await _context.HabitCompletions.AddAsync(newCompletion);
    }

    // Son Adım: Değişiklikleri veritabanına kaydet.
    await _context.SaveChangesAsync();

    return Result.Success();
  }
}