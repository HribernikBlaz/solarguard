using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[ApiController]
public abstract class CrudController<T>(AppDbContext db) : ControllerBase where T : Entity
{
    [HttpGet]
    public async Task<ActionResult<List<T>>> GetAll() => await db.Set<T>().AsNoTracking().ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<T>> Get(Guid id)
    {
        var item = await db.Set<T>().AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<T>> Create(T item)
    {
        item.Id = Guid.NewGuid();
        db.Add(item);
        if (!await TrySave()) return BadRequest("Neveljaven tuji ključ.");
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, T item)
    {
        var existing = await db.Set<T>().FindAsync(id);
        if (existing is null) return NotFound();
        item.Id = id;
        db.Entry(existing).CurrentValues.SetValues(item);
        if (!await TrySave()) return BadRequest("Neveljaven tuji ključ.");
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await db.Set<T>().FindAsync(id);
        if (existing is null) return NotFound();
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
