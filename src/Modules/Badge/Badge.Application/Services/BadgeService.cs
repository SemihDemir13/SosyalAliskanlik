using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Core.Helpers;
using SosyalAliskanlikApp.Modules.Badge.Application.DTOs;
using SosyalAliskanlikApp.Modules.Badge.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Badge.Domain.Entities;
using SosyalAliskanlikApp.Persistence;

namespace SosyalAliskanlikApp.Modules.Badge.Application.Services;

public class BadgeService : IBadgeService
{
    private readonly ApplicationDbContext _context;

    public BadgeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task CheckAndAwardBadgesAsync(Guid userId, Guid habitId)
    {
       
        var userBadgeCodes = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => ub.Badge.Code)
            .ToListAsync();
    
        await CheckFirstCompletionBadge(userId, userBadgeCodes);
        
        await CheckStreakBadges(userId, habitId, userBadgeCodes);
        
        
    }
    public async Task<IEnumerable<BadgeDto>> GetUserBadgesAsync(Guid userId)
    {
        var badges = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => ub.Badge) // Sadece ilişkili Badge nesnesini al
            .Select(b => new BadgeDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                IconUrl = b.IconUrl
            })
            .Distinct() // Bir rozeti birden fazla kez kazanma ihtimaline karşı
            .ToListAsync();
            
        return badges;
    }

   private async Task CheckFirstCompletionBadge(Guid userId, List<string> userBadgeCodes)
{
    
    if (userBadgeCodes.Contains("FIRST_COMPLETION")) return;

    
    await AwardBadgeToUser(userId, "FIRST_COMPLETION");
}

    private async Task CheckStreakBadges(Guid userId, Guid habitId, List<string> userBadgeCodes)
    {
        // Kontrol edeceğimiz seri rozetleri
        var streakMilestones = new Dictionary<int, string>
        {
            { 7, "STREAK_7_DAYS" },
            { 30, "STREAK_30_DAYS" }
        };

        // Bu alışkanlığa ait tüm tamamlama tarihlerini çek
        var completionDates = await _context.HabitCompletions
            .Where(hc => hc.HabitId == habitId)
            .Select(hc => hc.CompletionDate)
            .ToListAsync();
            
        // Seriyi hesapla (Bu metodu HabitService'ten alıp buraya taşıyabiliriz veya ortak bir yere koyabiliriz)
        var currentStreak = StreakCalculator.Calculate(completionDates);

        foreach (var milestone in streakMilestones)
        {
            // Eğer kullanıcı seriye ulaşmışsa VE bu rozete zaten sahip değilse
            if (currentStreak >= milestone.Key && !userBadgeCodes.Contains(milestone.Value))
            {
                await AwardBadgeToUser(userId, milestone.Value);
            }
        }
    }
    
    private async Task AwardBadgeToUser(Guid userId, string badgeCode)
    {
        var badge = await _context.Badges.FirstOrDefaultAsync(b => b.Code == badgeCode);
        if (badge is null) return; 

        var newUserBadge = new UserBadge
        {
            UserId = userId,
            BadgeId = badge.Id
        };
        await _context.UserBadges.AddAsync(newUserBadge);
        
        
    }
    
   
}