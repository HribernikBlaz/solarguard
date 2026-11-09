using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public static class SavingsRules
{
    // prices so urejene naraščajoče po ValidFrom; ura pred prvo ceno uporabi prvo ceno
    public static decimal PriceAt(IReadOnlyList<ElectricityPriceChange> prices, DateTime hour)
    {
        var valid = prices.LastOrDefault(p => p.ValidFrom <= hour) ?? prices[0];

        return valid.PricePerKwh;
    }

    public static Savings Calculate(IEnumerable<HourlyProduction> hours, IReadOnlyList<ElectricityPriceChange> prices, decimal currentPrice, DateTime now)
    {
        var local = Slovenia.ToLocal(now);
        var dayStart = Slovenia.ToUtc(local.Date);
        var monthStart = Slovenia.ToUtc(new DateTime(local.Year, local.Month, 1));
        var yearStart = Slovenia.ToUtc(new DateTime(local.Year, 1, 1));
        decimal day = 0, month = 0, year = 0, total = 0;

        foreach (var hour in hours)
        {
            var value = hour.Kwh * PriceAt(prices, hour.Hour);
            total += value;
            if (hour.Hour >= yearStart)
                year += value;

            if (hour.Hour >= monthStart)
                month += value;

            if (hour.Hour >= dayStart)
                day += value;
        }

        return new Savings(currentPrice, Round(day), Round(month), Round(year), Round(total));
    }

    private static decimal Round(decimal euros) => Math.Round(euros, 2, MidpointRounding.AwayFromZero);
}
