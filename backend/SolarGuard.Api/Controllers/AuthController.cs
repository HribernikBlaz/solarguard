using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Controllers;

public record RegisterRequest(string? Email, string? Password, string? FirstName, string? LastName);
public record CreateUserRequest(string? Email, string? Password, string? FirstName, string? LastName, string? Role);
public record LoginRequest(string? Email, string? Password);
public record AuthResponse(string Token, DateTime ExpiresAt, string Email, string Name, string Role);

[ApiController]
[Route("api/auth")]
public class AuthController(UserManager<AppUser> users, SignInManager<AppUser> signIn, IConfiguration config) : ControllerBase
{
    static readonly TimeSpan TokenLifetime = TimeSpan.FromHours(8);

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest r)
    {
        // vloga ni del zahtevka: samostojno se da registrirati samo Lastnik
        var (user, errors) = await CreateUser(r.Email, r.Password, r.FirstName, r.LastName, AppRoles.Owner);
        if (user is null)
            return BadRequest(new { errors });

        await RecordLogin(user);

        return Ok(Issue(user, AppRoles.Owner));
    }

    [HttpPost("users")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> CreateByAdmin(CreateUserRequest r)
    {
        if (r.Role is null || !AppRoles.All.Contains(r.Role))
            return BadRequest(new { errors = new[] { "Neveljavna vloga." } });
        var (user, errors) = await CreateUser(r.Email, r.Password, r.FirstName, r.LastName, r.Role);
        return user is null ? BadRequest(new { errors }) : Created("", new { user.Id, user.Email, Role = r.Role });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest r)
    {
        var user = r.Email is null ? null : await users.FindByEmailAsync(r.Email);
        var bad = Unauthorized(new { error = "Napačen e-poštni naslov ali geslo." });
        if (user is null || r.Password is null) return bad;

        var result = await signIn.CheckPasswordSignInAsync(user, r.Password, lockoutOnFailure: true);
        if (result.IsLockedOut) return StatusCode(423, new { error = "Račun je zaklenjen za 5 minut zaradi preveč napačnih poskusov." });
        if (!result.Succeeded) return bad;

        await RecordLogin(user);
        var role = (await users.GetRolesAsync(user)).FirstOrDefault() ?? AppRoles.Owner;
        return Ok(Issue(user, role));
    }

    // Za statistiko "aktivni uporabniki" v administratorskem pregledu.
    async Task RecordLogin(AppUser user)
    {
        user.LastLoginAt = DateTime.UtcNow;
        await users.UpdateAsync(user);
    }

    async Task<(AppUser? User, string[] Errors)> CreateUser(string? email, string? password, string? firstName, string? lastName, string role)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)
            || string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
            return (null, ["Vsa polja so obvezna."]);

        var user = new AppUser { UserName = email, Email = email, FirstName = firstName.Trim(), LastName = lastName.Trim() };
        var created = await users.CreateAsync(user, password);
        if (!created.Succeeded) return (null, created.Errors.Select(Describe).Distinct().ToArray());

        var added = await users.AddToRoleAsync(user, role);
        if (!added.Succeeded)
        {
            await users.DeleteAsync(user); // brez vloge račun ne sme ostati
            return (null, ["Računa ni bilo mogoče ustvariti."]);
        }
        return (user, []);
    }

    static string Describe(IdentityError e) => e.Code switch
    {
        "DuplicateEmail" or "DuplicateUserName" => "E-poštni naslov je že v uporabi.",
        "InvalidEmail" or "InvalidUserName" => "Neveljaven e-poštni naslov.",
        "PasswordTooShort" => "Geslo mora imeti vsaj 8 znakov.",
        "PasswordRequiresDigit" => "Geslo mora vsebovati vsaj eno številko.",
        _ => e.Description,
    };

    AuthResponse Issue(AppUser user, string role)
    {
        var expires = DateTime.UtcNow.Add(TokenLifetime);
        var name = $"{user.FirstName} {user.LastName}";
        var token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim("sub", user.Id.ToString()),
                new Claim("name", name),
                new Claim("role", role),
            ]),
            Expires = expires,
            SigningCredentials = new SigningCredentials(Key(config), SecurityAlgorithms.HmacSha256),
        });
        return new AuthResponse(token, expires, user.Email!, name, role);
    }

    public static SymmetricSecurityKey Key(IConfiguration config) =>
        new(Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("Manjka Jwt:Key.")));
}
