using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;
using SolarGuard.Api.Services;

namespace SolarGuard.Api.Controllers;

[Route("api/installations")]
public class InstallationsController(AppDbContext db, ProductionService production) : CrudController<Installation>(db)
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

    [HttpGet("{id:guid}/production")]
    public async Task<ActionResult<ProductionComparison>> Production(Guid id, string period = "dan")
    {
        if (!ProductionService.Periods.Contains(period))
            return BadRequest("Neveljavno obdobje.");

        var installation = await Visible().AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
        if (installation is null)
            return NotFound();

        return await production.Compare(installation, period, DateTime.UtcNow);
    }
}
