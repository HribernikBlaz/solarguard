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
        var orders = Db.ServiceOrders.AsQueryable();
        if (!IsAdmin)
        {
            var userId = UserId;
            var own = OwnInstallations();
            orders = orders.Where(o => o.AssigneeId == userId || own.Any(i => i.Id == o.InstallationId));
        }

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
                x.Order.ClosedAt))
            .AsNoTracking()
            .ToListAsync();
    }
}
