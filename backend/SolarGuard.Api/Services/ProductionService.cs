using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public class ProductionService(AppDbContext db, OpenMeteoClient openMeteo)
{
    public static readonly string[] Periods = ["dan", "teden", "mesec", "leto"];

    private static readonly TimeZoneInfo Zone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Ljubljana");

    public async Task<ProductionComparison> Compare(Installation installation, string period, DateTime now)
    {
        var slots = Slots(period, now);
        var from = slots[0];
        var to = NextSlot(period, slots[^1]);

        var panelIds = db.Devices.Where(d => d.InstallationId == installation.Id && d.Type == DeviceType.Panel).Select(d => d.Id);
        var hours = await db.Measurements
            .Where(m => panelIds.Contains(m.DeviceId) && m.Timestamp >= from && m.Timestamp < to)
            .GroupBy(m => m.Timestamp)
            .Select(g => new { Timestamp = g.Key, Kwh = g.Sum(m => m.ProductionKwh) })
            .AsNoTracking()
            .ToListAsync();

        var (irradiance, warning) = await LoadIrradiance(installation, period);
        var actual = new Dictionary<DateTime, double>();
        var expected = new Dictionary<DateTime, double>();
        var matchedActual = 0.0;
        var matchedExpected = 0.0;

        foreach (var hour in hours)
        {
            var slot = SlotOf(period, hour.Timestamp);
            var kwh = (double)hour.Kwh;
            actual[slot] = actual.GetValueOrDefault(slot) + kwh;

            if (irradiance is null || !irradiance.TryGetValue(hour.Timestamp, out var wm2))
                continue;

            var expectedKwh = ProductionRules.ExpectedKwh(wm2, installation.RatedPowerKw);
            expected[slot] = expected.GetValueOrDefault(slot) + expectedKwh;
            matchedActual += kwh;
            matchedExpected += expectedKwh;
        }

        var points = slots
            .Select(s => new ProductionPoint(s, Math.Round(actual.GetValueOrDefault(s), 3), irradiance is null ? null : Math.Round(expected.GetValueOrDefault(s), 3)))
            .ToList();
        double? deviation = null;
        if (irradiance is not null && matchedExpected > 0)
            deviation = Math.Round((matchedActual - matchedExpected) / matchedExpected * 100, 1);

        return new ProductionComparison(period, points, deviation, warning);
    }

    private async Task<(Dictionary<DateTime, double>? Irradiance, string? Warning)> LoadIrradiance(Installation installation, string period)
    {
        if (period is not ("dan" or "teden"))
            return (null, "Pričakovana proizvodnja je na voljo samo za dan in teden.");

        if (installation.Latitude == 0 && installation.Longitude == 0)
            return (null, "Lokacija sistema ni nastavljena, pričakovane proizvodnje ni mogoče izračunati.");

        var irradiance = await openMeteo.GetIrradiance(installation.Latitude, installation.Longitude);
        if (irradiance is null)
            return (null, "Napoved vremena ni na voljo, pričakovane proizvodnje ni mogoče izračunati.");

        return (irradiance, null);
    }

    private static DateTime ToLocal(DateTime utc) => TimeZoneInfo.ConvertTimeFromUtc(utc, Zone);

    private static DateTime ToUtc(DateTime local) => TimeZoneInfo.ConvertTimeToUtc(local, Zone);

    private static List<DateTime> Slots(string period, DateTime now)
    {
        var today = ToLocal(now).Date;

        return period switch
        {
            "dan" => Enumerable.Range(0, 24).Select(h => ToUtc(today).AddHours(h)).ToList(),
            "teden" => Enumerable.Range(-6, 7).Select(d => ToUtc(today.AddDays(d))).ToList(),
            "mesec" => Enumerable.Range(-29, 30).Select(d => ToUtc(today.AddDays(d))).ToList(),
            _ => Enumerable.Range(-11, 12).Select(m => ToUtc(new DateTime(today.Year, today.Month, 1).AddMonths(m))).ToList(),
        };
    }

    private static DateTime NextSlot(string period, DateTime slot) => period switch
    {
        "dan" => slot.AddHours(1),
        "leto" => ToUtc(ToLocal(slot).AddMonths(1)),
        _ => ToUtc(ToLocal(slot).AddDays(1)),
    };

    private static DateTime SlotOf(string period, DateTime timestamp)
    {
        var local = ToLocal(timestamp);

        return period switch
        {
            "dan" => new DateTime(timestamp.Year, timestamp.Month, timestamp.Day, timestamp.Hour, 0, 0, DateTimeKind.Utc),
            "leto" => ToUtc(new DateTime(local.Year, local.Month, 1)),
            _ => ToUtc(local.Date),
        };
    }
}
