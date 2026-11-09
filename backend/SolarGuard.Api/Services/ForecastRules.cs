using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public static class ForecastRules
{
    public const double WeakDay = 0.5;
    public const double GoodDay = 1.3;
    public const int BaselineDays = 7;
    public const int CloudFromHour = 9;
    public const int CloudToHour = 15;

    // Napoved je za dneve od danes naprej; ocena dneva je glede na povprečje prejšnjih BaselineDays dni.
    public static Forecast Calculate(IReadOnlyList<HourlyWeather> weather, decimal ratedPowerKw, DateTime now, int days)
    {
        var today = DateOnly.FromDateTime(Slovenia.ToLocal(now));
        var perDay = weather
            .Select(h => (Local: Slovenia.ToLocal(h.Hour), Weather: h))
            .GroupBy(x => DateOnly.FromDateTime(x.Local))
            .ToDictionary(g => g.Key, g => g.ToList());

        var expected = perDay.ToDictionary(d => d.Key, d => d.Value.Sum(x => ProductionRules.ExpectedKwh(x.Weather.Gti, ratedPowerKw)));
        var past = Enumerable.Range(1, BaselineDays)
            .Select(back => today.AddDays(-back))
            .Where(expected.ContainsKey)
            .Select(day => expected[day])
            .ToList();
        var baseline = past.Count > 0 ? past.Average() : 0;

        var forecast = Enumerable.Range(0, days)
            .Select(offset => today.AddDays(offset))
            .Where(expected.ContainsKey)
            .Select(day => new ForecastDay(
                day,
                Math.Round(expected[day], 3),
                MiddayCloud(perDay[day]),
                Grade(baseline > 0 ? expected[day] / baseline : 1)))
            .ToList();

        return new Forecast(forecast, Math.Round(baseline, 3), null);
    }

    public static ForecastGrade Grade(double ratioToBaseline)
    {
        if (ratioToBaseline < WeakDay)
            return ForecastGrade.Weak;

        if (ratioToBaseline > GoodDay)
            return ForecastGrade.Good;

        return ForecastGrade.Normal;
    }

    private static double? MiddayCloud(List<(DateTime Local, HourlyWeather Weather)> day)
    {
        var midday = day.Where(x => x.Local.Hour >= CloudFromHour && x.Local.Hour <= CloudToHour).ToList();
        if (midday.Count == 0)
            return null;

        return Math.Round(midday.Average(x => x.Weather.CloudPercent));
    }
}
