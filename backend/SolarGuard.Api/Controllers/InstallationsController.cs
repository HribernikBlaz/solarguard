using Microsoft.AspNetCore.Mvc;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/installations")]
public class InstallationsController(AppDbContext db) : CrudController<Installation>(db);
