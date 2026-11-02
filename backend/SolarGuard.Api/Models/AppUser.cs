using Microsoft.AspNetCore.Identity;

namespace SolarGuard.Api.Models;

public class AppUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
}

public static class AppRoles
{
    public const string Owner = "Lastnik";
    public const string Technician = "Serviser";
    public const string Admin = "Admin";

    public static readonly string[] All = [Owner, Technician, Admin];
}
