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

    protected bool IsTechnician => User.IsInRole(AppRoles.Technician);

    // Za branje vidi serviser tudi sisteme, kjer je določen; OwnInstallations (pisanje) ga ne vključuje.
    protected IQueryable<Installation> VisibleInstallations()
    {
        if (!IsTechnician)
            return OwnInstallations();

        var uid = UserId;

        return db.Installations.Where(i => i.TechnicianId == uid);
    }

    protected IQueryable<Device> VisibleDevices()
    {
        var visible = VisibleInstallations();

        return db.Devices.Where(d => visible.Any(i => i.Id == d.InstallationId));
    }

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
