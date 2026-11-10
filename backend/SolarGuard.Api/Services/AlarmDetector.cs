using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public class AlarmDetector(AppDbContext db, OpenMeteoClient openMeteo, IConfiguration configuration, ILogger<AlarmDetector> logger)
{
    private readonly record struct Check(bool Evaluated, AlarmSeverity? Severity, string Description);

    private static readonly Check NotEvaluated = new(false, null, "");
    private static readonly Check AllClear = new(true, null, "");

    public async Task Run(DateTime now)
    {
        var installations = await db.Installations.AsNoTracking().ToListAsync();
        var fallbackAdminId = await FindAdminId();
        foreach (var installation in installations)
            await CheckInstallation(installation, now, fallbackAdminId);
    }

    private async Task<Guid?> FindAdminId()
    {
        var admins = await (from u in db.Users
                            join ur in db.UserRoles on u.Id equals ur.UserId
                            join r in db.Roles on ur.RoleId equals r.Id
                            where r.Name == AppRoles.Admin
                            orderby u.Email
                            select new { u.Id, u.Email })
            .AsNoTracking()
            .ToListAsync();
        var configuredEmail = configuration["Admin:Email"];
        var configured = admins.FirstOrDefault(a => string.Equals(a.Email, configuredEmail, StringComparison.OrdinalIgnoreCase));

        return configured?.Id ?? admins.FirstOrDefault()?.Id;
    }

    private async Task CheckInstallation(Installation installation, DateTime now, Guid? fallbackAdminId)
    {
        var devices = await db.Devices.AsNoTracking().Where(d => d.InstallationId == installation.Id).ToListAsync();
        if (devices.Count == 0)
            return;

        var deviceIds = devices.Select(d => d.Id).ToList();
        var lastMeasurements = await db.Measurements
            .Where(m => deviceIds.Contains(m.DeviceId) && m.Timestamp <= now)
            .GroupBy(m => m.DeviceId)
            .Select(g => new { DeviceId = g.Key, Timestamp = g.Max(m => m.Timestamp) })
            .ToDictionaryAsync(x => x.DeviceId, x => x.Timestamp);
        var since = now.AddHours(-(AlarmRules.ConsecutiveHours + 3));
        var recentMeasurements = await db.Measurements
            .Where(m => deviceIds.Contains(m.DeviceId) && m.Timestamp > since && m.Timestamp <= now)
            .AsNoTracking()
            .ToListAsync();
        var recent = recentMeasurements
            .GroupBy(m => (m.DeviceId, m.Timestamp))
            .ToDictionary(g => g.Key, g => (double)g.Sum(m => m.ProductionKwh));
        var irradiance = await LoadIrradiance(installation);
        var panelCount = devices.Count(d => d.Type == DeviceType.Panel);
        var active = await db.Alarms.Where(a => deviceIds.Contains(a.DeviceId) && a.Status == AlarmStatus.Active).ToListAsync();
        var assigneeId = installation.TechnicianId ?? fallbackAdminId;

        foreach (var device in devices)
        {
            DateTime? last = lastMeasurements.TryGetValue(device.Id, out var timestamp) ? timestamp : null;
            var missing = AlarmRules.IsMissing(last, device.InstalledOn, now);

            Sync(device, installation, assigneeId, AlarmType.MissingMeasurements, MissingCheck(missing, last), active, now);
            if (device.Type == DeviceType.Panel)
                Sync(device, installation, assigneeId, AlarmType.LowProduction, missing ? NotEvaluated : LowProductionCheck(device, last, recent, irradiance, installation, panelCount), active, now);
        }

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException e)
        {
            logger.LogWarning(e, "Alarmov za sistem {Installation} ni bilo mogoče shraniti", installation.Name);
            db.ChangeTracker.Clear();
        }
    }

    private async Task<Dictionary<DateTime, double>?> LoadIrradiance(Installation installation)
    {
        if (installation.Latitude == 0 && installation.Longitude == 0)
            return null;

        return await openMeteo.GetIrradiance(installation.Latitude, installation.Longitude);
    }

    private static Check MissingCheck(bool missing, DateTime? last)
    {
        if (!missing)
            return AllClear;

        if (last is null)
            return new(true, AlarmSeverity.Critical, "Naprava še ni poslala nobene meritve.");

        var lastLocal = Slovenia.ToLocal(last.Value);

        return new(true, AlarmSeverity.Critical, $"Ni meritev več kot 2 uri (zadnja {lastLocal:dd.MM.yyyy HH:mm}).");
    }

    private static Check LowProductionCheck(
        Device panel,
        DateTime? last,
        Dictionary<(Guid, DateTime), double> recent,
        Dictionary<DateTime, double>? irradiance,
        Installation installation,
        int panelCount)
    {
        if (irradiance is null || last is null)
            return NotEvaluated;

        var hours = new List<(double Actual, double Expected)>();
        for (var i = 0; i < AlarmRules.ConsecutiveHours; i++)
        {
            var hour = last.Value.AddHours(-i);
            if (!recent.TryGetValue((panel.Id, hour), out var actual))
                return AllClear;

            if (!irradiance.TryGetValue(hour, out var wm2))
                return NotEvaluated;

            hours.Add((actual, ProductionRules.ExpectedKwh(wm2, installation.RatedPowerKw) / panelCount));
        }

        var severity = AlarmRules.LowProduction(hours);
        if (severity is null)
            return AllClear;

        var deviation = hours.Average(h => (h.Expected - h.Actual) / h.Expected) * 100;

        return new(true, severity, $"Proizvodnja je že {AlarmRules.ConsecutiveHours} ure zapored v povprečju {deviation:F0} % pod pričakovano.");
    }

    private void Sync(Device device, Installation installation, Guid? assigneeId, AlarmType type, Check check, List<Alarm> active, DateTime now)
    {
        if (!check.Evaluated)
            return;

        var current = active.Where(a => a.DeviceId == device.Id && a.Type == type).ToList();
        foreach (var alarm in current.Where(a => a.Severity != check.Severity))
        {
            alarm.Status = AlarmStatus.Resolved;
            alarm.ResolvedAt = now;
        }

        if (check.Severity is not { } severity || current.Any(a => a.Severity == severity))
            return;

        var created = new Alarm
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            Type = type,
            Severity = severity,
            Status = AlarmStatus.Active,
            DetectedAt = now,
            Description = check.Description,
        };
        db.Alarms.Add(created);
        active.Add(created);

        if (severity != AlarmSeverity.Critical)
            return;

        var order = CreateServiceOrder(created, device, installation, assigneeId, now);
        NotifyCritical(created, order, device, installation, now);
    }

    private ServiceOrder CreateServiceOrder(Alarm alarm, Device device, Installation installation, Guid? assigneeId, DateTime now)
    {
        if (assigneeId is null)
            logger.LogWarning("Za sistem {Installation} ni serviserja ne administratorja, nalog ostane nedodeljen", installation.Name);

        var order = new ServiceOrder
        {
            Id = Guid.NewGuid(),
            AlarmId = alarm.Id,
            InstallationId = installation.Id,
            AssigneeId = assigneeId,
            Status = ServiceOrderStatus.Open,
            Description = $"{device.Type} {device.SerialNumber}: {alarm.Description}",
            CreatedAt = now,
        };
        db.ServiceOrders.Add(order);

        return order;
    }

    // Obvestila nastanejo v isti transakciji kot alarm in nalog; e-pošto pošlje NotificationMailer.
    private void NotifyCritical(Alarm alarm, ServiceOrder order, Device device, Installation installation, DateTime now)
    {
        if (installation.OwnerId is { } ownerId)
        {
            var message = AlarmNotificationRules.CriticalAlarmMessage(installation.Name, $"{device.Type} {device.SerialNumber}", alarm.Description);
            db.Notifications.Add(Notification.Create(ownerId, NotificationKind.CriticalAlarm, message, AlarmNotificationRules.AlarmKey(alarm.Id, ownerId), now));
        }

        if (order.AssigneeId is { } assigneeId)
        {
            var message = AlarmNotificationRules.ServiceOrderMessage(installation.Name, order.Description);
            db.Notifications.Add(Notification.Create(assigneeId, NotificationKind.ServiceOrderAssigned, message, AlarmNotificationRules.ServiceOrderKey(order.Id, assigneeId), now));
        }
    }
}
