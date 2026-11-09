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
            .Select(n => new NotificationView(n.Id, n.Kind, n.Message, n.CreatedAt))
            .AsNoTracking()
            .ToListAsync();
    }
}
