using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Modules.Statistics.Application.DTOs;
using SosyalAliskanlikApp.Modules.Statistics.Application.Interfaces;
using SosyalAliskanlikApp.Persistence;

namespace SosyalAliskanlikApp.Modules.Statistics.Application.Services;

public class StatisticsService : IStatisticsService
{
    private readonly ApplicationDbContext _context;

    public StatisticsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserStatisticsDto> GetUserStatisticsAsync(Guid userId)
    {
        // 1. Kullanıcının tüm alışkanlıklarını ve tamamlama kayıtlarını veritabanından çek.
        var userHabits = await _context.Habits
            .Where(h => h.UserId == userId)
            .Include(h => h.HabitCompletions) // İlişkili tamamlama kayıtlarını da getir.
            .ToListAsync();

        if (!userHabits.Any())
        {
            // Kullanıcının hiç alışkanlığı yoksa, boş bir istatistik nesnesi dön.
            return new UserStatisticsDto { TotalHabits = 0, TotalCompletions = 0, OverallSuccessRate = 0 };
        }

        // 2. İstatistikleri hesapla.
        int totalHabits = userHabits.Count;
        int totalCompletions = userHabits.Sum(h => h.HabitCompletions.Count);
        
        // Başarı oranını hesapla: (Toplam tamamlanan gün) / (Her alışkanlık için geçen gün sayısı toplamı)
        // Bu, daha doğru bir başarı oranı verir.
        double totalPossibleDays = userHabits.Sum(h => (DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - h.CreatedAt.Day) + 1);
        double successRate = (totalPossibleDays > 0) ? (double)totalCompletions / totalPossibleDays * 100 : 0;

        // En istikrarlı alışkanlığı bul.
        var mostConsistentHabit = userHabits
            .OrderByDescending(h => h.HabitCompletions.Count)
            .FirstOrDefault();

        // 3. DTO'yu oluştur ve doldur.
        var statisticsDto = new UserStatisticsDto
        {
            TotalHabits = totalHabits,
            TotalCompletions = totalCompletions,
            OverallSuccessRate = Math.Round(successRate, 2), // Sonucu 2 ondalık basamağa yuvarla.
            MostConsistentHabit = mostConsistentHabit?.Name ?? "N/A"
        };

        return statisticsDto;
    }
}