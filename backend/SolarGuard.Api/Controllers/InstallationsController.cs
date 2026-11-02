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
        if (existing is not null)
            item.OwnerId = existing.OwnerId;
        else if (!IsAdmin || item.OwnerId is null)
            item.OwnerId = UserId;

        return Task.FromResult<string?>(null);
    }
}
