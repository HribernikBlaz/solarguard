using DeviceService.Data;
using DeviceService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeviceService.Controllers;

[ApiController]
[Route("api/devices")]
public class DevicesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<Device>> GetAll() => await db.Devices.AsNoTracking().ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Device>> Get(Guid id)
    {
        var device = await db.Devices.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
        return device is null ? NotFound() : device;
    }

    [HttpPost]
    public async Task<ActionResult<Device>> Create(Device device)
    {
        device.Id = Guid.NewGuid();
        db.Add(device);
        if (!await TrySave())
            return Conflict("Serijska številka že obstaja.");

        return CreatedAtAction(nameof(Get), new { id = device.Id }, device);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, Device device)
    {
        var existing = await db.Devices.FindAsync(id);
        if (existing is null)
            return NotFound();

        device.Id = id;
        db.Entry(existing).CurrentValues.SetValues(device);
        if (!await TrySave())
            return Conflict("Serijska številka že obstaja.");

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await db.Devices.FindAsync(id);
        if (existing is null)
            return NotFound();

        db.Remove(existing);
        await db.SaveChangesAsync();

        return NoContent();
    }

    async Task<bool> TrySave()
    {
        try
        {
            await db.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException)
        {
            return false;
        }
    }
}
