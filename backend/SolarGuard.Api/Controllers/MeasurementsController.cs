using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/measurements")]
public class MeasurementsController(AppDbContext db) : CrudController<Measurement>(db)
{
    protected override IQueryable<Measurement> Visible()
    {
        if (IsAdmin)
            return Db.Measurements;

        var own = OwnDevices();

        return Db.Measurements.Where(m => own.Any(d => d.Id == m.DeviceId));
    }

    protected override async Task<string?> Prepare(Measurement item, Measurement? existing)
    {
        var deviceIsVisible = await OwnDevices().AnyAsync(d => d.Id == item.DeviceId);
        if (!deviceIsVisible)
            return "Neveljavna naprava.";

        return null;
    }
}
