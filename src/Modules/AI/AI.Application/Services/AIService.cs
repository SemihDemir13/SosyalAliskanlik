using Google.AI.GenerativeAI;
using Microsoft.Extensions.Configuration;
using SosyalAliskanlikApp.Modules.AI.Application.DTOs;
using SosyalAliskanlikApp.Modules.AI.Application.Interfaces;
using SosyalAliskanlikApp.Shared;
using System.Text.Json;
using System.Text.RegularExpressions;
namespace SosyalAliskanlikApp.Modules.AI.Application.Services;
public class AIService : IAIService {
    private readonly GenerativeModel _model;
    public AIService(IConfiguration configuration) {
        var apiKey = configuration["Google:ApiKey"];
        if (string.IsNullOrEmpty(apiKey)) throw new InvalidOperationException("Google Gemini API anahtarı bulunamadı.");
        _model = new GenerativeModel(apiKey, model: "gemini-1.5-flash");
    }
    public async Task<Result<List<HabitSuggestionDto>>> GetHabitSuggestionsAsync(string userGoal) {
        try {
            var prompt = $"Sen, kullanıcılara kişisel gelişim hedefleri için basit, uygulanabilir ve pozitif alışkanlıklar öneren bir yardımcısın. Cevapların her zaman sadece JSON formatında olmalı. Kullanıcıya asla normal metinle cevap verme. Kullanıcının hedefi: '{userGoal}'. Bu hedefe ulaşmasına yardımcı olacak 3 adet alışkanlık öner. Cevabını şu JSON formatında bir dizi olarak ver: [{{'name': 'Alışkanlık Adı', 'description': 'Kısa ve motive edici açıklama'}}]";
            var response = await _model.GenerateContentAsync(prompt);
            var cleanJsonResponse = Regex.Replace(response.Text, @"^```json\s*|\s*```$", "", RegexOptions.Multiline).Trim();
            var suggestions = JsonSerializer.Deserialize<List<HabitSuggestionDto>>(cleanJsonResponse, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return suggestions is not null ? Result.Success(suggestions) : Result.Failure<List<HabitSuggestionDto>>("Yapay zekadan geçerli bir cevap alınamadı.");
        }
        catch (Exception ex) {
            return Result.Failure<List<HabitSuggestionDto>>($"Yapay zeka ile iletişim kurulurken bir hata oluştu: {ex.Message}");
        }
    }
}