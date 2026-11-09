using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/devices")]
public class DevicesController(AppDbContext db) : CrudController<Device>(db)
{
    protected override IQueryable<Device> Visible() => VisibleDevices();

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

    protected override async Task<string?> CanDelete(Device item)
    {
        var hasActiveOrder = await Db.ServiceOrders
            .Where(o => o.Status != ServiceOrderStatus.Completed)
            .AnyAsync(o => Db.Alarms.Any(a => a.Id == o.AlarmId && a.DeviceId == item.Id));
        if (hasActiveOrder)
            return "Naprave ni mogoče izbrisati, ker ima nezaključen servisni nalog.";

        return null;
    }
}
