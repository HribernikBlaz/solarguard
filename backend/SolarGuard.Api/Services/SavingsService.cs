using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public class SavingsService(AppDbContext db)
{
    public async Task<Savings> Calculate(Installation installation, DateTime now)
    {
        var prices = await db.ElectricityPriceChanges
            .Where(c => c.InstallationId == installation.Id)
            .OrderBy(c => c.ValidFrom)
            .AsNoTracking()
            .ToListAsync();
        if (installation.ElectricityPrice is not { } currentPrice || prices.Count == 0)
            return new Savings(null, null, null, null, null);

        var panelIds = db.Devices.Where(d => d.InstallationId == installation.Id && d.Type == DeviceType.Panel).Select(d => d.Id);
        // shortcut: bere vse ure od namestitve naenkrat, ko jih bo preveč za pomnilnik, seštevaj v bazi po dnevih
        var hours = await db.Measurements
            .Where(m => panelIds.Contains(m.DeviceId))
            .GroupBy(m => m.Timestamp)
            .Select(g => new HourlyProduction(g.Key, g.Sum(m => m.ProductionKwh)))
            .AsNoTracking()
            .ToListAsync();

        return SavingsRules.Calculate(hours, prices, currentPrice, now);
    }
}
