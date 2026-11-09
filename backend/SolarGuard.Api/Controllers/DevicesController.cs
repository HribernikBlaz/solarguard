using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;
using SolarGuard.Api.Services;

namespace SolarGuard.Api.Controllers;

[Route("api/devices")]
public class DevicesController(AppDbContext db) : CrudController<Device>(db)
{
    private const int MaxHistory = 200;

    protected override IQueryable<Device> Visible() => VisibleDevices();

    protected override async Task<string?> Prepare(Device item, Device? existing)
    {
        item.Manufacturer = (item.Manufacturer ?? "").Trim();
        item.Model = (item.Model ?? "").Trim();
        item.SerialNumber = (item.SerialNumber ?? "").Trim();
        if (item.Manufacturer == "" || item.Model == "" || item.SerialNumber == "")
            return "Proizvajalec, model in serijska številka so obvezni.";

        if (item.InstalledOn == default)
            return "Datum namestitve je obvezen.";

        if (!await OwnInstallations().AnyAsync(i => i.Id == item.InstallationId))
            return "Neveljaven sistem.";

        if (await Db.Devices.AnyAsync(d => d.InstallationId == item.InstallationId && d.SerialNumber == item.SerialNumber && d.Id != item.Id))
            return "Serijska številka je v tem sistemu že uporabljena.";

        return null;
    }

    [HttpGet("{id:guid}/service-history")]
    public async Task<ActionResult<List<ServiceHistoryItem>>> ServiceHistory(Guid id, DateOnly? from, DateOnly? to)
    {
        if (from > to)
            return BadRequest("Datum Od mora biti pred datumom Do.");

        var visible = await Visible().AnyAsync(d => d.Id == id);
        if (!visible)
            return NotFound();

        var orders = Db.ServiceOrders.Join(
            Db.Alarms.Where(a => a.DeviceId == id),
            o => o.AlarmId,
            a => a.Id,
            (o, a) => new { Order = o, Alarm = a });

        if (from is { } start)
        {
            var startUtc = Slovenia.ToUtc(start.ToDateTime(TimeOnly.MinValue));
            orders = orders.Where(x => x.Order.CreatedAt >= startUtc);
        }

        if (to is { } end)
        {
            var endUtc = Slovenia.ToUtc(end.AddDays(1).ToDateTime(TimeOnly.MinValue));
            orders = orders.Where(x => x.Order.CreatedAt < endUtc);
        }

        return await orders
            .OrderByDescending(x => x.Order.CreatedAt)
            .Take(MaxHistory)
            .Select(x => new ServiceHistoryItem(
                x.Order.Id,
                x.Order.Status,
                x.Order.CreatedAt,
                x.Order.ClosedAt,
                x.Alarm.Description,
                x.Order.Summary,
                Db.Users.Where(u => u.Id == x.Order.AssigneeId).Select(u => u.FirstName + " " + u.LastName).FirstOrDefault()))
            .AsNoTracking()
            .ToListAsync();
    }

    // Zgodovine ne brišemo skupaj z napravo (kaskada v bazi bi izbrisala tudi zaključene naloge).
    protected override async Task<string?> CanDelete(Device item)
    {
        var orders = Db.ServiceOrders.Where(o => Db.Alarms.Any(a => a.Id == o.AlarmId && a.DeviceId == item.Id));
        var hasActiveOrder = await orders.AnyAsync(o => o.Status != ServiceOrderStatus.Completed);
        if (hasActiveOrder)
            return "Naprave ni mogoče izbrisati, ker ima nezaključen servisni nalog.";

        var hasHistory = await orders.AnyAsync();
        if (hasHistory)
            return "Naprave ni mogoče izbrisati, ker ima servisno zgodovino.";

        return null;
    }
}
