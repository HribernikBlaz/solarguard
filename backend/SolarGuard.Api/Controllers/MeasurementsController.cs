using Microsoft.AspNetCore.Mvc;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

[Route("api/measurements")]
public class MeasurementsController(AppDbContext db) : CrudController<Measurement>(db);
