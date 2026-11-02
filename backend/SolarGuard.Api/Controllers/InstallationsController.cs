using Microsoft.AspNetCore.Mvc;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/installations")]
public class InstallationsController(AppDbContext db) : CrudController<Installation>(db)
{
    protected override IQueryable<Installation> Visible() => OwnInstallations();

    protected override Task<string?> Prepare(Installation item, Installation? existing)
    {
        item.OwnerId = existing is null ? (IsAdmin ? item.OwnerId : null) ?? UserId : existing.OwnerId;
        return Task.FromResult<string?>(null);
    }
}
