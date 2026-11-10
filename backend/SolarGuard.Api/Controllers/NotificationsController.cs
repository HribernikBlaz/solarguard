using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/notifications")]
public class NotificationsController(AppDbContext db) : OwnedController(db)
{
    private const int MaxNotifications = 200;

    [HttpGet]
    public async Task<ActionResult<List<NotificationView>>> GetAll()
    {
        var userId = UserId;

        return await Db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(MaxNotifications)
            .Select(n => new NotificationView(n.Id, n.Kind, n.Message, n.CreatedAt, n.EmailStatus))
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpGet("settings")]
    public async Task<ActionResult<NotificationSettings>> GetSettings()
    {
        var userId = UserId;
        var milestones = await Db.Users.Where(u => u.Id == userId).Select(u => u.NotifyMilestones).SingleAsync();

        return new NotificationSettings(milestones, true);
    }

    [HttpPut("settings")]
    public async Task<ActionResult<NotificationSettings>> PutSettings(NotificationSettingsRequest request)
    {
        var userId = UserId;
        await Db.Users.Where(u => u.Id == userId).ExecuteUpdateAsync(s => s.SetProperty(u => u.NotifyMilestones, request.Milestones));

        return new NotificationSettings(request.Milestones, true);
    }
}
