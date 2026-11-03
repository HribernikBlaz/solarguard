using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace SolarGuard.Api.Services;

public class OpenMeteoClient(HttpClient http, IMemoryCache cache, ILogger<OpenMeteoClient> logger)
{
    private const string TiltDegrees = "30";
    private const string AzimuthDegrees = "0";
    private const int PastDays = 8;
    private static readonly TimeSpan CacheTime = TimeSpan.FromMinutes(15);

    public async Task<Dictionary<DateTime, double>?> GetIrradiance(decimal latitude, decimal longitude)
    {
        var key = string.Create(CultureInfo.InvariantCulture, $"irradiance|{latitude}|{longitude}");
        if (cache.TryGetValue(key, out Dictionary<DateTime, double>? cached))
            return cached;

        var url = string.Create(CultureInfo.InvariantCulture,
            $"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}"
            + $"&hourly=global_tilted_irradiance&tilt={TiltDegrees}&azimuth={AzimuthDegrees}"
            + $"&past_days={PastDays}&forecast_days=2&timezone=UTC");

        try
        {
            using var json = JsonDocument.Parse(await http.GetStringAsync(url));
            var hourly = json.RootElement.GetProperty("hourly");
            var times = hourly.GetProperty("time").EnumerateArray()
                .Select(t => DateTime.SpecifyKind(DateTime.ParseExact(t.GetString()!, "yyyy-MM-dd'T'HH:mm", CultureInfo.InvariantCulture), DateTimeKind.Utc));
            var values = hourly.GetProperty("global_tilted_irradiance").EnumerateArray()
                .Select(v => v.ValueKind == JsonValueKind.Null ? 0 : v.GetDouble());
            var irradiance = times.Zip(values).ToDictionary(pair => pair.First, pair => pair.Second);
            cache.Set(key, irradiance, CacheTime);

            return irradiance;
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException or FormatException)
        {
            logger.LogWarning(e, "Napoved Open-Meteo ni na voljo za {Latitude}, {Longitude}", latitude, longitude);

            return null;
        }
    }
}
