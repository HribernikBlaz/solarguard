using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/devices")]
public class DevicesController(AppDbContext db) : CrudController<Device>(db)
{
    protected override IQueryable<Device> Visible() => OwnDevices();

    protected override async Task<string?> Prepare(Device item, Device? existing)
    {
        item.Manufacturer = (item.Manufacturer ?? "").Trim();
        item.Model = (item.Model ?? "").Trim();
        item.SerialNumber = (item.SerialNumber ?? "").Trim();
        if (item.Manufacturer == "" || item.Model == "" || item.SerialNumber == "")
            return "Proizvajalec, model in serijska številka so obvezni.";

        if (item.InstalledOn == default)
            return "Datum namestitve je obvezen.";

        if (!await OwnInstallations().AnyAsync(i => i.Id == item.InstallationId))
            return "Neveljaven sistem.";

        if (await Db.Devices.AnyAsync(d => d.InstallationId == item.InstallationId && d.SerialNumber == item.SerialNumber && d.Id != item.Id))
            return "Serijska številka je v tem sistemu že uporabljena.";

        return null;
    }
}
