using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public class WarrantyChecker(AppDbContext db)
{
    public async Task Run(DateTime now)
    {
        var today = DateOnly.FromDateTime(Slovenia.ToLocal(now));
        var limit = today.AddDays(WarrantyRules.WarningDays);

        var expiring = await (from d in db.Devices
                              join i in db.Installations on d.InstallationId equals i.Id
                              where d.WarrantyUntil >= today && d.WarrantyUntil <= limit && i.OwnerId != null
                              select new { d.Id, d.Type, d.SerialNumber, d.WarrantyUntil, InstallationName = i.Name, OwnerId = i.OwnerId })
            .AsNoTracking()
            .ToListAsync();

        var candidates = expiring
            .Select(e => new { Device = e, UserId = e.OwnerId!.Value })
            .Select(x => (x.Device, x.UserId, Key: WarrantyRules.DedupeKey(x.Device.Id, x.Device.WarrantyUntil, x.UserId)))
            .ToList();
        var keys = candidates.Select(c => c.Key).ToList();
        var known = await db.Notifications.Where(n => keys.Contains(n.DedupeKey)).Select(n => n.DedupeKey).ToListAsync();

        foreach (var (device, userId, key) in candidates.Where(c => !known.Contains(c.Key)))
        {
            var message = WarrantyRules.Message(device.Type, device.SerialNumber, device.InstallationName, device.WarrantyUntil, today);
            db.Notifications.Add(Notification.Create(userId, NotificationKind.WarrantyExpiring, message, key, now));
        }

        await db.SaveChangesAsync();
    }
}
