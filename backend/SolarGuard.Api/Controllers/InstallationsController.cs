using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;
using SolarGuard.Api.Services;

namespace SolarGuard.Api.Controllers;

[Route("api/installations")]
public class InstallationsController(AppDbContext db, ProductionService production, SavingsService savings) : CrudController<Installation>(db)
{
    private const decimal MaxPricePerKwh = 10m;

    protected override IQueryable<Installation> Visible() => VisibleInstallations();

    protected override void Redact(Installation item)
    {
        if (IsTechnician)
            item.ElectricityPrice = null;
    }

    protected override async Task<string?> Prepare(Installation item, Installation? existing)
    {
        var priceError = RecordPrice(item, existing);
        if (priceError is not null)
            return priceError;

        if (existing is not null)
            item.OwnerId = existing.OwnerId;
        else if (!IsAdmin || item.OwnerId is null)
            item.OwnerId = UserId;

        if (!IsAdmin)
        {
            item.TechnicianId = existing?.TechnicianId;

            return null;
        }

        if (item.TechnicianId is { } technicianId && !await HasTechnicianRole(technicianId))
            return "Izbrani uporabnik ni serviser.";

        return null;
    }

    // Vsaka sprememba cene doda vrstico zgodovine, stare ostanejo, zato se pretekli prihranek ne preračuna.
    private string? RecordPrice(Installation item, Installation? existing)
    {
        if (item.ElectricityPrice is not { } enteredPrice)
        {
            if (existing?.ElectricityPrice is null)
                return null;

            return "Cene elektrike ni mogoče odstraniti, vnesite novo ceno.";
        }

        var price = Math.Round(enteredPrice, 4, MidpointRounding.AwayFromZero);
        if (price <= 0 || price > MaxPricePerKwh)
            return $"Cena elektrike mora biti večja od 0 in največ {MaxPricePerKwh} €/kWh.";

        item.ElectricityPrice = price;
        if (price == existing?.ElectricityPrice)
            return null;

        Db.ElectricityPriceChanges.Add(new ElectricityPriceChange
        {
            Id = Guid.NewGuid(),
            InstallationId = item.Id,
            PricePerKwh = price,
            ValidFrom = DateTime.UtcNow,
        });

        return null;
    }

    protected override async Task<string?> CanDelete(Installation item)
    {
        var orders = Db.ServiceOrders.Where(o => o.InstallationId == item.Id);
        var hasActiveOrder = await orders.AnyAsync(o => o.Status != ServiceOrderStatus.Completed);
        if (hasActiveOrder)
            return "Sistema ni mogoče izbrisati, ker ima nezaključen servisni nalog.";

        var hasHistory = await orders.AnyAsync();
        if (hasHistory)
            return "Sistema ni mogoče izbrisati, ker ima servisno zgodovino.";

        return null;
    }

    private async Task<bool> HasTechnicianRole(Guid userId) =>
        await (from ur in Db.UserRoles
               join r in Db.Roles on ur.RoleId equals r.Id
               where ur.UserId == userId && r.Name == AppRoles.Technician
               select ur).AnyAsync();

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

    [HttpGet("{id:guid}/savings")]
    public async Task<ActionResult<Savings>> GetSavings(Guid id)
    {
        if (IsTechnician)
            return Forbid();

        var installation = await Visible().AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
        if (installation is null)
            return NotFound();

        return await savings.Calculate(installation, DateTime.UtcNow);
    }
}
