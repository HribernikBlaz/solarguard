namespace SolarGuard.Api.Models;

public record HourlyProduction(DateTime Hour, decimal Kwh);

public record Savings(decimal? PricePerKwh, decimal? Day, decimal? Month, decimal? Year, decimal? Total);
