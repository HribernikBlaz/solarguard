using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public class MilestoneChecker(AppDbContext db)
{
    public async Task Run(DateTime now)
    {
        // shortcut: vsota čez vse meritve ob vsakem preverjanju; pri večjem obsegu bi hranili tekočo vsoto.
        var totals = await (from m in db.Measurements
                            join d in db.Devices on m.DeviceId equals d.Id
                            where d.Type == DeviceType.Panel && m.Timestamp <= now
                            group m by d.InstallationId into g
                            select new { InstallationId = g.Key, TotalKwh = g.Sum(m => m.ProductionKwh) })
            .ToDictionaryAsync(x => x.InstallationId, x => x.TotalKwh);

        var owners = await (from i in db.Installations
                            join u in db.Users on i.OwnerId equals u.Id
                            where u.NotifyMilestones
                            select new { InstallationId = i.Id, i.Name, UserId = u.Id })
            .AsNoTracking()
            .ToListAsync();

        var candidates = new List<(string Name, Guid UserId, int Threshold, string Key)>();
        foreach (var owner in owners)
        {
            var reached = totals.TryGetValue(owner.InstallationId, out var total) ? MilestoneRules.Reached(total) : null;
            if (reached is not { } threshold)
                continue;

            candidates.Add((owner.Name, owner.UserId, threshold, MilestoneRules.DedupeKey(owner.InstallationId, threshold, owner.UserId)));
        }

        var keys = candidates.Select(c => c.Key).ToList();
        var known = await db.Notifications.Where(n => keys.Contains(n.DedupeKey)).Select(n => n.DedupeKey).ToListAsync();

        foreach (var (name, userId, threshold, key) in candidates.Where(c => !known.Contains(c.Key)))
            db.Notifications.Add(Notification.Create(userId, NotificationKind.ProductionMilestone, MilestoneRules.Message(name, threshold), key, now));

        await db.SaveChangesAsync();
    }
}
