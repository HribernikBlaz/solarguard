namespace SolarGuard.Api.Models;

public record HourlyWeather(DateTime Hour, double Gti, double CloudPercent);

public enum ForecastGrade
{
    Weak,
    Normal,
    Good
}

public record ForecastDay(DateOnly Date, double ExpectedKwh, double? CloudPercent, ForecastGrade Grade);

public record Forecast(List<ForecastDay> Days, double BaselineKwh, string? Warning);
