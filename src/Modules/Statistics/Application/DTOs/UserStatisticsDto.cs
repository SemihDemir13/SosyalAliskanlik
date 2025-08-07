namespace SosyalAliskanlikApp.Modules.Statistics.Application.DTOs;

public class UserStatisticsDto
{
    public int TotalHabits { get; set; }
    public int TotalCompletions { get; set; }
    public double OverallSuccessRate { get; set; }
    public string MostConsistentHabit { get; set; } = "N/A";
}
