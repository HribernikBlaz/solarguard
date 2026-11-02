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

// prvega admina ni mogoče ustvariti prek aplikacije, zato ga ustvarimo iz nastavitev
using (var scope = app.Services.CreateScope())
{
    var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var adminEmail = builder.Configuration["Admin:Email"];
    var adminPassword = builder.Configuration["Admin:Password"];
    var demoEmail = builder.Configuration["Demo:Email"];
    var demoPassword = builder.Configuration["Demo:Password"];

    async Task<AppUser?> CreateUser(string email, string password, string firstName, string lastName, string role)
    {
        var user = new AppUser { UserName = email, Email = email, FirstName = firstName, LastName = lastName };
        var created = await users.CreateAsync(user, password);
        if (created.Succeeded)
        {
            var added = await users.AddToRoleAsync(user, role);
            if (added.Succeeded)
                return user;
        }

        app.Logger.LogError("Uporabnik {Email} ni bil ustvarjen: {Errors}", email, string.Join(", ", created.Errors.Select(e => e.Description)));

        return null;
    }

    if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword))
    {
        var admins = await users.GetUsersInRoleAsync(AppRoles.Admin);
        if (admins.Count == 0)
            await CreateUser(adminEmail, adminPassword, "Admin", "Platforme", AppRoles.Admin);
    }

    if (!string.IsNullOrEmpty(demoEmail) && !string.IsNullOrEmpty(demoPassword))
    {
        var owner = await users.FindByEmailAsync(demoEmail);
        owner ??= await CreateUser(demoEmail, demoPassword, "Demo", "Lastnik", AppRoles.Owner);
        if (owner is not null)
            await db.Installations.Where(i => i.OwnerId == null).ExecuteUpdateAsync(s => s.SetProperty(i => i.OwnerId, owner.Id));
    }
}

app.Run();
