using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/alarms")]
public class AlarmsController(AppDbContext db) : OwnedController(db)
{
    private const int MaxAlarms = 200;

    [HttpGet]
    public async Task<ActionResult<List<AlarmView>>> GetAll(Guid? installationId)
    {
        var devices = OwnDevices();
        if (installationId is { } id)
            devices = devices.Where(d => d.InstallationId == id);

        return await Db.Alarms
            .Join(devices, a => a.DeviceId, d => d.Id, (a, d) => new { Alarm = a, Device = d })
            .Join(Db.Installations, x => x.Device.InstallationId, i => i.Id, (x, i) => new { x.Alarm, x.Device, Installation = i })
            .OrderByDescending(x => x.Alarm.DetectedAt)
            .Take(MaxAlarms)
            .Select(x => new AlarmView(
                x.Alarm.Id,
                x.Installation.Id,
                x.Installation.Name,
                x.Device.Id,
                x.Device.Type,
                x.Device.SerialNumber,
                x.Alarm.Type,
                x.Alarm.Severity,
                x.Alarm.Status,
                x.Alarm.DetectedAt,
                x.Alarm.ResolvedAt,
                x.Alarm.Description))
            .AsNoTracking()
            .ToListAsync();
    }
}
