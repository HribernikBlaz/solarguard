using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Controllers;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o =>
    o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddIdentityCore<AppUser>(o =>
    {
        o.User.RequireUniqueEmail = true;
        o.Password.RequiredLength = 8;
        o.Password.RequireDigit = true;
        o.Password.RequireNonAlphanumeric = false;
        o.Password.RequireUppercase = false;
        o.Password.RequireLowercase = false;
        o.Lockout.MaxFailedAccessAttempts = 3;
        o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();
builder.Services.AddAuthentication("Bearer").AddJwtBearer(o =>
{
    o.MapInboundClaims = false; // sicer se "role" preimenuje in RoleClaimType ne ujame
    o.TokenValidationParameters = new()
    {
        IssuerSigningKey = AuthController.Key(builder.Configuration),
        ValidateIssuer = false,
        ValidateAudience = false,
        NameClaimType = "name",
        RoleClaimType = "role",
    };
});
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// prvega admina ni mogoče ustvariti prek aplikacije, zato ga ustvarimo iz nastavitev (Admin:Email, Admin:Password)
if (builder.Configuration["Admin:Email"] is { Length: > 0 } adminEmail && builder.Configuration["Admin:Password"] is { Length: > 0 } adminPassword)
{
    using var scope = app.Services.CreateScope();
    var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    if ((await users.GetUsersInRoleAsync(AppRoles.Admin)).Count == 0)
    {
        var admin = new AppUser { UserName = adminEmail, Email = adminEmail, FirstName = "Admin", LastName = "Platforme" };
        var created = await users.CreateAsync(admin, adminPassword);
        if (created.Succeeded) await users.AddToRoleAsync(admin, AppRoles.Admin);
        else app.Logger.LogError("Admin ni bil ustvarjen: {Errors}", string.Join(", ", created.Errors.Select(e => e.Description)));
    }
}

app.Run();
