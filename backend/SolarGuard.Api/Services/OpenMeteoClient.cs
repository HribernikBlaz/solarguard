using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public class OpenMeteoClient(HttpClient http, IMemoryCache cache, ILogger<OpenMeteoClient> logger)
{
    private const string TiltDegrees = "30";
    private const string AzimuthDegrees = "0";
    private const int PastDays = 8;
    private const int ForecastDays = 16;
    // Vreme se osveži vsaj na 15 minut, kar je znotraj zahteve US-09 (najmanj vsakih 6 ur).
    private static readonly TimeSpan CacheTime = TimeSpan.FromMinutes(15);

    public async Task<Dictionary<DateTime, double>?> GetIrradiance(decimal latitude, decimal longitude)
    {
        var weather = await GetWeather(latitude, longitude);

        return weather?.ToDictionary(h => h.Hour, h => h.Gti);
    }

    public async Task<List<HourlyWeather>?> GetWeather(decimal latitude, decimal longitude)
    {
        var key = string.Create(CultureInfo.InvariantCulture, $"weather|{latitude}|{longitude}");
        if (cache.TryGetValue(key, out List<HourlyWeather>? cached))
            return cached;

        var url = string.Create(CultureInfo.InvariantCulture,
            $"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}"
            + $"&hourly=global_tilted_irradiance,cloud_cover&tilt={TiltDegrees}&azimuth={AzimuthDegrees}"
            + $"&past_days={PastDays}&forecast_days={ForecastDays}&timezone=UTC");

        try
        {
            using var json = JsonDocument.Parse(await http.GetStringAsync(url));
            var hourly = json.RootElement.GetProperty("hourly");
            var times = hourly.GetProperty("time").EnumerateArray()
                .Select(t => DateTime.SpecifyKind(DateTime.ParseExact(t.GetString()!, "yyyy-MM-dd'T'HH:mm", CultureInfo.InvariantCulture), DateTimeKind.Utc));
            var irradiance = hourly.GetProperty("global_tilted_irradiance").EnumerateArray().Select(OrZero);
            var cloud = hourly.GetProperty("cloud_cover").EnumerateArray().Select(OrZero);
            var weather = times
                .Zip(irradiance, cloud)
                .Select(x => new HourlyWeather(x.First, x.Second, x.Third))
                .ToList();
            cache.Set(key, weather, CacheTime);

            return weather;
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException or FormatException)
        {
            logger.LogWarning(e, "Napoved Open-Meteo ni na voljo za {Latitude}, {Longitude}", latitude, longitude);

            return null;
        }
    }

    private static double OrZero(JsonElement value) => value.ValueKind == JsonValueKind.Null ? 0 : value.GetDouble();
}
