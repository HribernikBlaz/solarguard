using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[ApiController]
[Authorize]
public abstract class OwnedController(AppDbContext db) : ControllerBase
{
    protected AppDbContext Db => db;
    protected Guid UserId => Guid.Parse(User.FindFirstValue("sub")!);
    protected bool IsAdmin => User.IsInRole(AppRoles.Admin);

    protected IQueryable<Installation> OwnInstallations()
    {
        if (IsAdmin)
            return db.Installations;

        var uid = UserId;

        return db.Installations.Where(i => i.OwnerId == uid);
    }

    protected IQueryable<Device> OwnDevices()
    {
        var own = OwnInstallations();

        return db.Devices.Where(d => own.Any(i => i.Id == d.InstallationId));
    }
}
