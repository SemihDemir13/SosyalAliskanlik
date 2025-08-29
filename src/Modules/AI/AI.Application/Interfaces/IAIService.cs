using SosyalAliskanlikApp.Modules.AI.Application.DTOs;
using SosyalAliskanlikApp.Shared;
namespace SosyalAliskanlikApp.Modules.AI.Application.Interfaces;

public interface IAIService
{
    Task<Result<List<HabitSuggestionDto>>> GetHabitSuggestionsAsync(string userGoal);
}