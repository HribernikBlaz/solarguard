using Microsoft.AspNetCore.Mvc;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/devices")]
public class DevicesController(AppDbContext db) : CrudController<Device>(db);
