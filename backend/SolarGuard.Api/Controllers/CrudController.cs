using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

public abstract class CrudController<T>(AppDbContext db) : OwnedController(db) where T : Entity
{
    protected abstract IQueryable<T> Visible();

    protected virtual Task<string?> Prepare(T item, T? existing) => Task.FromResult<string?>(null);

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

        Db.Add(item);
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

        Db.Entry(existing).CurrentValues.SetValues(item);
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

        Db.Remove(existing);
        await Db.SaveChangesAsync();

        return NoContent();
    }

    const string SaveError = "Shranjevanje ni uspelo (neveljaven tuji ključ ali podvojen vnos).";

    async Task<bool> TrySave()
    {
        try
        {
            await Db.SaveChangesAsync();

            return true;
        }
        catch (DbUpdateException)
        {
            return false;
        }
    }
}
