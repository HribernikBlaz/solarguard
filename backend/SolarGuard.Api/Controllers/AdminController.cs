using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/admin")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminController(AppDbContext db) : OwnedController(db)
{
    // Sistem je aktiven, če je v zadnjem dnevu poslal meritev; uporabnik, če se je v zadnjih 30 dneh prijavil.
    private static readonly TimeSpan ActiveSystemWindow = TimeSpan.FromDays(1);
    private static readonly TimeSpan ActiveUserWindow = TimeSpan.FromDays(30);

    [HttpGet("overview")]
    public async Task<ActionResult<AdminOverview>> Overview()
    {
        var now = DateTime.UtcNow;
        var systemsSince = now - ActiveSystemWindow;
        var usersSince = now - ActiveUserWindow;

        // shortcut: vrne vse sisteme naenkrat, ko jih bo več tisoč, prestavi iskanje in oštevilčenje na strežnik
        var systems = await Db.Installations
            .OrderBy(i => i.Name)
            .Select(i => new
            {
                i.Id,
                i.Name,
                i.Address,
                i.RatedPowerKw,
                OwnerName = Db.Users.Where(u => u.Id == i.OwnerId).Select(u => u.FirstName + " " + u.LastName).FirstOrDefault(),
                OwnerEmail = Db.Users.Where(u => u.Id == i.OwnerId).Select(u => u.Email).FirstOrDefault(),
                DeviceCount = Db.Devices.Count(d => d.InstallationId == i.Id),
                LastMeasurementAt = Db.Measurements
                    .Where(m => Db.Devices.Any(d => d.Id == m.DeviceId && d.InstallationId == i.Id))
                    .Max(m => (DateTime?)m.Timestamp),
                OpenOrders = Db.ServiceOrders.Count(o => o.InstallationId == i.Id && o.Status != ServiceOrderStatus.Completed),
            })
            .AsNoTracking()
            .ToListAsync();

        var counts = await Db.ServiceOrders
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);

        var orders = new OrderCounts(
            counts.GetValueOrDefault(ServiceOrderStatus.Open),
            counts.GetValueOrDefault(ServiceOrderStatus.Assigned),
            counts.GetValueOrDefault(ServiceOrderStatus.InProgress),
            counts.GetValueOrDefault(ServiceOrderStatus.Completed));

        return new AdminOverview(
            systems.Count,
            await Db.Devices.CountAsync(),
            await Db.Users.CountAsync(),
            await Db.Users.CountAsync(u => u.LastLoginAt >= usersSince),
            orders,
            systems
                .Select(s => new AdminInstallationView(
                    s.Id,
                    s.Name,
                    s.Address,
                    s.RatedPowerKw,
                    s.OwnerName,
                    s.OwnerEmail,
                    s.DeviceCount,
                    s.LastMeasurementAt,
                    s.OpenOrders,
                    s.LastMeasurementAt >= systemsSince))
                .ToList());
    }
}
