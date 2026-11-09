using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/service-orders")]
public class ServiceOrdersController(AppDbContext db) : OwnedController(db)
{
    private const int MaxOrders = 200;

    [HttpGet]
    public async Task<ActionResult<List<ServiceOrderView>>> GetAll(Guid? installationId)
    {
        var currentUserId = UserId;
        var orders = VisibleOrders();
        if (installationId is { } id)
            orders = orders.Where(o => o.InstallationId == id);

        return await orders
            .Join(Db.Alarms, o => o.AlarmId, a => a.Id, (o, a) => new { Order = o, Alarm = a })
            .Join(Db.Devices, x => x.Alarm.DeviceId, d => d.Id, (x, d) => new { x.Order, x.Alarm, Device = d })
            .Join(Db.Installations, x => x.Order.InstallationId, i => i.Id, (x, i) => new { x.Order, x.Alarm, x.Device, Installation = i })
            .OrderByDescending(x => x.Order.CreatedAt)
            .Take(MaxOrders)
            .Select(x => new ServiceOrderView(
                x.Order.Id,
                x.Installation.Id,
                x.Installation.Name,
                x.Installation.Address,
                x.Device.Type,
                x.Device.SerialNumber,
                x.Alarm.Severity,
                x.Order.Description,
                x.Order.Status,
                x.Order.AssigneeId,
                Db.Users.Where(u => u.Id == x.Order.AssigneeId).Select(u => u.FirstName + " " + u.LastName).FirstOrDefault(),
                x.Order.CreatedAt,
                x.Order.ClosedAt,
                x.Order.Summary,
                x.Order.AssigneeId == currentUserId))
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpGet("{id:guid}/history")]
    public async Task<ActionResult<List<ServiceOrderChangeView>>> History(Guid id)
    {
        var visible = await VisibleOrders().AnyAsync(o => o.Id == id);
        if (!visible)
            return NotFound();

        return await Db.ServiceOrderChanges
            .Where(c => c.ServiceOrderId == id)
            .OrderBy(c => c.ChangedAt)
            .Select(c => new ServiceOrderChangeView(
                c.Status,
                c.ChangedAt,
                Db.Users.Where(u => u.Id == c.ChangedById).Select(u => u.FirstName + " " + u.LastName).FirstOrDefault() ?? ""))
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> ChangeStatus(Guid id, ChangeStatusRequest request)
    {
        var order = await VisibleOrders().FirstOrDefaultAsync(o => o.Id == id);
        if (order is null)
            return NotFound();

        if (order.AssigneeId != UserId)
            return Forbid();

        if ((int)request.Status != (int)order.Status + 1)
            return Conflict("Status je mogoče spremeniti samo na naslednjega v vrstnem redu.");

        var summary = (request.Summary ?? "").Trim();
        if (request.Status == ServiceOrderStatus.Completed && summary == "")
            return BadRequest("Ob zaključku je opis opravljenega dela obvezen.");

        if (summary.Length > ServiceOrder.MaxSummaryLength)
            return BadRequest($"Opis je lahko dolg največ {ServiceOrder.MaxSummaryLength} znakov.");

        var now = DateTime.UtcNow;
        order.Status = request.Status;
        if (request.Status == ServiceOrderStatus.Completed)
        {
            order.Summary = summary;
            order.ClosedAt = now;
        }

        Db.ServiceOrderChanges.Add(new ServiceOrderChange
        {
            Id = Guid.NewGuid(),
            ServiceOrderId = order.Id,
            Status = request.Status,
            ChangedAt = now,
            ChangedById = UserId,
        });

        try
        {
            await Db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict("Status naloga se je medtem spremenil, osvežite seznam.");
        }

        return NoContent();
    }

    private IQueryable<ServiceOrder> VisibleOrders()
    {
        if (IsAdmin)
            return Db.ServiceOrders;

        var userId = UserId;
        var own = OwnInstallations();

        return Db.ServiceOrders.Where(o => o.AssigneeId == userId || own.Any(i => i.Id == o.InstallationId));
    }
}
