// Dosya: tests/Core.Tests/StreakCalculatorTests.cs

using FluentAssertions;
using SosyalAliskanlikApp.Core.Helpers;

namespace Core.Tests;

public class StreakCalculatorTests
{
    [Fact]
    public void Calculate_ShouldReturnZero_WhenDatesAreEmpty()
    {
        var dates = new List<DateOnly>();

        var result = StreakCalculator.Calculate(dates);

        result.Should().Be(0);
    }

    [Fact]
    public void Calculate_ShouldReturnOne_WhenOnlyTodayIsCompleted()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dates = new List<DateOnly> { today };

        var result = StreakCalculator.Calculate(dates);

        result.Should().Be(1);
    }

    [Fact]
    public void Calculate_ShouldReturnOne_WhenOnlyYesterdayIsCompleted()
    {
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var dates = new List<DateOnly> { yesterday };

        var result = StreakCalculator.Calculate(dates);

        result.Should().Be(1);
    }

    [Fact]
    public void Calculate_ShouldReturnTwo_ForTodayAndYesterday()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);
        var dates = new List<DateOnly> { today, yesterday };

        var result = StreakCalculator.Calculate(dates);

        result.Should().Be(2);
    }

    [Fact]
    public void Calculate_ShouldReturnOne_WhenThereIsAGap()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var twoDaysAgo = today.AddDays(-2);
        var dates = new List<DateOnly> { today, twoDaysAgo };

        var result = StreakCalculator.Calculate(dates);

        
        result.Should().Be(1);
    }

    [Fact]
    public void Calculate_ShouldReturnZero_IfLastCompletionWasTwoDaysAgo()
    {
        var twoDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2));
        var threeDaysAgo = twoDaysAgo.AddDays(-1);
        var dates = new List<DateOnly> { twoDaysAgo, threeDaysAgo };

        var result = StreakCalculator.Calculate(dates);

        result.Should().Be(0);
    }
    
    [Fact]
    public void Calculate_ShouldCalculateCorrectly_WithUnsortedAndDuplicateDates()
    {
        
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dates = new List<DateOnly>
        {
            today.AddDays(-5), 
            today.AddDays(-1), 
            today,             
            today.AddDays(-2),
            today          
        };

        var result = StreakCalculator.Calculate(dates);

        result.Should().Be(3);
    }
}