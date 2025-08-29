namespace SosyalAliskanlikApp.Core.Helpers;

public static class StreakCalculator
{
    
    public static int Calculate(List<DateOnly> dates)
    {
        if (dates == null || !dates.Any()) return 0;
        var sortedDates = dates.OrderByDescending(d => d).ToList();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);
        if (sortedDates.First() < yesterday) return 0;
        int streak = 0;
        var currentDate = sortedDates.Contains(today) ? today : yesterday;
        while (sortedDates.Contains(currentDate))
        {
            streak++;
            currentDate = currentDate.AddDays(-1);
        }
        return streak;
    }
}