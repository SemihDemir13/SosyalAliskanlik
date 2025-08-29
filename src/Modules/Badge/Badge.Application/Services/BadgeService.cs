// Dosya: src/Modules/Badge/Badge.Application/Services/BadgeService.cs

using Microsoft.EntityFrameworkCore;
using SosyalAliskanlikApp.Core.Helpers;
using SosyalAliskanlikApp.Modules.Badge.Application.DTOs;
using SosyalAliskanlikApp.Modules.Badge.Application.Interfaces;
using SosyalAliskanlikApp.Modules.Badge.Domain.Entities;
using SosyalAliskanlikApp.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

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

        // "İlk Adım" rozetini, bu eyleme neden olan habitId ile birlikte kontrol et.
        await CheckFirstCompletionBadge(userId, userBadgeCodes, habitId);

        // Seri rozetlerini, bu eyleme neden olan habitId ile birlikte kontrol et.
        await CheckStreakBadges(userId, habitId, userBadgeCodes);
    }

    public async Task<IEnumerable<BadgeDto>> GetUserBadgesAsync(Guid userId)
    {
         var badges = await _context.UserBadges
        .Where(ub => ub.UserId == userId)
        .Include(ub => ub.Badge)
        .Include(ub => ub.RelatedHabit) 
        .Select(ub => new BadgeDto
            {
                Id = ub.Badge.Id,
                Name = ub.Badge.Name,
                Description = ub.Badge.Description,
                IconUrl = ub.Badge.IconUrl,
                RelatedHabitName = ub.RelatedHabit != null ? ub.RelatedHabit.Name : null 
            })
            .Distinct()
            .ToListAsync();
            
        return badges;
    }
    
   public async Task RecheckAllBadgesForUserAsync(Guid userId)
{
      var userBadgeCodes = await _context.UserBadges
        .Where(ub => ub.UserId == userId)
        .Select(ub => ub.Badge.Code)
        .ToListAsync();

    var userHabitsWithCompletions = await _context.Habits
        .Where(h => h.UserId == userId)
        .Select(h => new 
        {
            HabitId = h.Id,
            CompletionDates = h.HabitCompletions.Select(hc => hc.CompletionDate).ToList()
        })
        .ToListAsync();
        
    if (!userHabitsWithCompletions.Any()) return;

    // --- ROZET KONTROLLERİ ---

    // A) "İlk Adım" Rozeti Kontrolü
    bool hasAnyCompletion = userHabitsWithCompletions.Any(h => h.CompletionDates.Any());
    if (hasAnyCompletion && !userBadgeCodes.Contains("FIRST_COMPLETION"))
    {
        await AwardBadgeToUser(userId, "FIRST_COMPLETION");
    }

    // B) "Seri" Rozetleri Kontrolü
    foreach (var habit in userHabitsWithCompletions)
    {
        int streak = StreakCalculator.Calculate(habit.CompletionDates);
        if (streak >= 7 && !userBadgeCodes.Contains("STREAK_7_DAYS"))
        {
            await AwardBadgeToUser(userId, "STREAK_7_DAYS", habit.HabitId);
        }
        if (streak >= 30 && !userBadgeCodes.Contains("STREAK_30_DAYS"))
        {
            await AwardBadgeToUser(userId, "STREAK_30_DAYS", habit.HabitId);
        }
    }
    
    // C) YENİ KISIM: "Toplam Tamamlama" Rozetleri Kontrolü
    // Kullanıcının tüm alışkanlıklarındaki toplam tamamlama sayısını hesapla.
    int totalCompletions = userHabitsWithCompletions.Sum(h => h.CompletionDates.Count);

    if (totalCompletions >= 10 && !userBadgeCodes.Contains("TOTAL_10_COMPLETIONS"))
    {
        await AwardBadgeToUser(userId, "TOTAL_10_COMPLETIONS");
    }
    if (totalCompletions >= 50 && !userBadgeCodes.Contains("TOTAL_50_COMPLETIONS"))
    {
        await AwardBadgeToUser(userId, "TOTAL_50_COMPLETIONS");
    }

    // Değişiklikleri kaydet.
    await _context.SaveChangesAsync();
}

    private async Task CheckFirstCompletionBadge(Guid userId, List<string> userBadgeCodes, Guid habitId)
    {
         if (userBadgeCodes.Contains("FIRST_COMPLETION")) return;
         await AwardBadgeToUser(userId, "FIRST_COMPLETION", habitId);
    }

    private async Task CheckStreakBadges(Guid userId, Guid habitId, List<string> userBadgeCodes)
    {
        var streakMilestones = new Dictionary<int, string>
        {
            { 7, "STREAK_7_DAYS" },
            { 30, "STREAK_30_DAYS" }
        };

        var completionDates = await _context.HabitCompletions
            .Where(hc => hc.HabitId == habitId)
            .Select(hc => hc.CompletionDate)
            .ToListAsync();
            
        var currentStreak = StreakCalculator.Calculate(completionDates);

        foreach (var milestone in streakMilestones)
        {
            if (currentStreak >= milestone.Key && !userBadgeCodes.Contains(milestone.Value))
            {
                await AwardBadgeToUser(userId, milestone.Value, habitId);
            }
        }
    }

    private async Task AwardBadgeToUser(Guid userId, string badgeCode, Guid? habitId = null)
    {
       var badge = await _context.Badges.FirstOrDefaultAsync(b => b.Code == badgeCode);
    if (badge is null) return;
    
    bool alreadyHasBadge = await _context.UserBadges
                                 .AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badge.Id);
    
    if (alreadyHasBadge && !habitId.HasValue) return;

    if (alreadyHasBadge && habitId.HasValue)
    {
        bool hasForThisHabit = await _context.UserBadges
            .AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badge.Id && ub.RelatedHabitId == habitId);
        if (hasForThisHabit) return;
    }

    var newUserBadge = new UserBadge
    {
        UserId = userId,
        BadgeId = badge.Id,
        RelatedHabitId = habitId
    };
    await _context.UserBadges.AddAsync(newUserBadge);
    }
}