// Dosya: tests/Core.Tests/StreakCalculatorTests.cs

using FluentAssertions;
using SosyalAliskanlikApp.Core.Helpers;

namespace Core.Tests;

public class StreakCalculatorTests
{
    // Test 1: Liste boşken, mevcut seri 0 olmalı.
    [Fact]
    public void Calculate_ShouldReturnZero_WhenDatesAreEmpty()
    {
        // Arrange
        var dates = new List<DateOnly>();

        // Act
        var result = StreakCalculator.Calculate(dates);

        // Assert
        result.Should().Be(0);
    }

    // Test 2: Sadece bugün tamamlandıysa, mevcut seri 1 olmalı.
    [Fact]
    public void Calculate_ShouldReturnOne_WhenOnlyTodayIsCompleted()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dates = new List<DateOnly> { today };

        // Act
        var result = StreakCalculator.Calculate(dates);

        // Assert
        result.Should().Be(1);
    }

    // Test 3: Sadece dün tamamlandıysa, mevcut seri 1 olmalı.
    [Fact]
    public void Calculate_ShouldReturnOne_WhenOnlyYesterdayIsCompleted()
    {
        // Arrange
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var dates = new List<DateOnly> { yesterday };

        // Act
        var result = StreakCalculator.Calculate(dates);

        // Assert
        result.Should().Be(1);
    }

    // Test 4: Bugün ve dün tamamlandıysa, mevcut seri 2 olmalı.
    [Fact]
    public void Calculate_ShouldReturnTwo_ForTodayAndYesterday()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);
        var dates = new List<DateOnly> { today, yesterday };

        // Act
        var result = StreakCalculator.Calculate(dates);

        // Assert
        result.Should().Be(2);
    }

    // Test 5: Arada bir gün boşluk varsa (dün tamamlanmamışsa), mevcut seri 1 olmalı (sadece bugünden sayar).
    [Fact]
    public void Calculate_ShouldReturnOne_WhenThereIsAGap()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var twoDaysAgo = today.AddDays(-2);
        var dates = new List<DateOnly> { today, twoDaysAgo };

        // Act
        var result = StreakCalculator.Calculate(dates);

        // Assert
        result.Should().Be(1);
    }

    // Test 6: Son tamamlama 2 gün önceyse, mevcut seri 0 olmalı.
    [Fact]
    public void Calculate_ShouldReturnZero_IfLastCompletionWasTwoDaysAgo()
    {
        // Arrange
        var twoDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2));
        var threeDaysAgo = twoDaysAgo.AddDays(-1);
        var dates = new List<DateOnly> { twoDaysAgo, threeDaysAgo };

        // Act
        var result = StreakCalculator.Calculate(dates);

        // Assert
        result.Should().Be(0);
    }
    
    // Test 7: Düzensiz ve sıralanmamış bir listede 3 günlük bir seri varsa doğru hesaplamalı.
    [Fact]
    public void Calculate_ShouldCalculateCorrectly_WithUnsortedAndDuplicateDates()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dates = new List<DateOnly>
        {
            today.AddDays(-5), // Eski, alakasız tarih
            today.AddDays(-1), // Dün
            today,             // Bugün
            today.AddDays(-2), // Evvelsi gün
            today              // Duplike tarih
        };

        // Act
        var result = StreakCalculator.Calculate(dates);

        // Assert
        result.Should().Be(3);
    }
}