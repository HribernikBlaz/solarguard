using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[ApiController]
[Authorize]
public abstract class CrudController<T>(AppDbContext db) : ControllerBase where T : Entity
{
    protected AppDbContext Db => db;
    protected Guid UserId => Guid.Parse(User.FindFirstValue("sub")!);
    protected bool IsAdmin => User.IsInRole(AppRoles.Admin);

    protected abstract IQueryable<T> Visible();

    protected virtual Task<string?> Prepare(T item, T? existing) => Task.FromResult<string?>(null);

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

    [HttpGet]
    public async Task<ActionResult<List<T>>> GetAll() => await Visible().AsNoTracking().ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<T>> Get(Guid id)
    {
        var item = await Visible().AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        if (item is null)
            return NotFound();

        return item;
    }

    [HttpPost]
    public async Task<ActionResult<T>> Create(T item)
    {
        item.Id = Guid.NewGuid();
        if (await Prepare(item, null) is { } error)
            return BadRequest(error);

        db.Add(item);
        if (!await TrySave())
            return BadRequest(SaveError);

        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, T item)
    {
        var existing = await Visible().FirstOrDefaultAsync(e => e.Id == id);
        if (existing is null)
            return NotFound();

        item.Id = id;
        if (await Prepare(item, existing) is { } error)
            return BadRequest(error);

        db.Entry(existing).CurrentValues.SetValues(item);
        if (!await TrySave())
            return BadRequest(SaveError);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await Visible().FirstOrDefaultAsync(e => e.Id == id);
        if (existing is null)
            return NotFound();

        db.Remove(existing);
        await db.SaveChangesAsync();

        return NoContent();
    }

    const string SaveError = "Shranjevanje ni uspelo (neveljaven tuji ključ ali podvojen vnos).";

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
