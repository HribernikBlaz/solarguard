using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/technicians")]
[Authorize(Roles = AppRoles.Admin)]
public class TechniciansController(AppDbContext db) : OwnedController(db)
{
    [HttpGet]
    public async Task<ActionResult<List<TechnicianView>>> GetAll() =>
        await (from u in Db.Users
               join ur in Db.UserRoles on u.Id equals ur.UserId
               join r in Db.Roles on ur.RoleId equals r.Id
               where r.Name == AppRoles.Technician
               orderby u.LastName, u.FirstName
               select new TechnicianView(u.Id, u.FirstName + " " + u.LastName))
            .AsNoTracking()
            .ToListAsync();
}
