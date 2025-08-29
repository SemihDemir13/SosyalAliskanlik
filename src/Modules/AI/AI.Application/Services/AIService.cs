using Microsoft.Extensions.Configuration; // Bu using'i ekliyoruz
using SosyalAliskanlikApp.Modules.AI.Application.DTOs;
using SosyalAliskanlikApp.Modules.AI.Application.Interfaces;
using SosyalAliskanlikApp.Shared;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
namespace SosyalAliskanlikApp.Modules.AI.Application.Services;
public class AIService : IAIService {
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _modelName = "gemini-1.5-flash";
    public AIService(IConfiguration configuration) {
        _apiKey = configuration["Google:ApiKey"] ?? throw new InvalidOperationException("Google Gemini API anahtarı bulunamadı.");
        _httpClient = new HttpClient();
    }
    public async Task<Result<List<HabitSuggestionDto>>> GetHabitSuggestionsAsync(string userGoal) {
        try {
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelName}:generateContent?key={_apiKey}";
            var prompt = $"Sen, kullanıcılara kişisel gelişim hedefleri için basit, uygulanabilir ve pozitif alışkanlıklar öneren bir yardımcısın. Cevapların her zaman sadece JSON formatında olmalı. Kullanıcıya asla normal metinle cevap verme. Kullanıcının hedefi: '{userGoal}'. Bu hedefe ulaşmasına yardımcı olacak 3 adet alışkanlık öner. Cevabını şu JSON formatında bir dizi olarak ver: [{{'name': 'Alışkanlık Adı', 'description': 'Kısa ve motive edici açıklama'}}]";
            var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
            var response = await _httpClient.PostAsJsonAsync(apiUrl, requestBody);
            if (!response.IsSuccessStatusCode) {
                var errorContent = await response.Content.ReadAsStringAsync();
                return Result.Failure<List<HabitSuggestionDto>>($"API isteği başarısız oldu: {response.StatusCode}. Detay: {errorContent}");
            }
            var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();
            var jsonText = jsonResponse.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            if (string.IsNullOrEmpty(jsonText)) return Result.Failure<List<HabitSuggestionDto>>("Yapay zekadan boş cevap alındı.");
            var cleanJsonResponse = Regex.Replace(jsonText, @"^```json\s*|\s*```$", "", RegexOptions.Multiline).Trim();
            var suggestions = JsonSerializer.Deserialize<List<HabitSuggestionDto>>(cleanJsonResponse, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return suggestions is not null ? Result.Success(suggestions) : Result.Failure<List<HabitSuggestionDto>>("Yapay zekadan geçerli bir cevap alınamadı.");
        }
        catch (Exception ex) {
            return Result.Failure<List<HabitSuggestionDto>>($"Yapay zeka ile iletişim kurulurken bir hata oluştu: {ex.Message}");
        }
    }
}