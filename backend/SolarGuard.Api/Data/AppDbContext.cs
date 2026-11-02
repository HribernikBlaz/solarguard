using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Installation> Installations => Set<Installation>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Measurement> Measurements => Set<Measurement>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.Entity<IdentityRole<Guid>>().HasData(AppRoles.All.Select((name, i) => new IdentityRole<Guid>
        {
            Id = Guid.Parse($"00000000-0000-0000-0000-00000000000{i + 1}"),
            Name = name,
            NormalizedName = name.ToUpperInvariant(),
            ConcurrencyStamp = $"role-{i + 1}",
        }));
        b.Entity<Installation>().HasOne<AppUser>().WithMany().HasForeignKey(i => i.OwnerId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Device>().HasIndex(d => new { d.InstallationId, d.SerialNumber }).IsUnique();
        b.Entity<Installation>().HasMany<Device>().WithOne().HasForeignKey(d => d.InstallationId);
        b.Entity<Device>().HasMany<Measurement>().WithOne().HasForeignKey(m => m.DeviceId);
        b.Entity<Device>().Property(d => d.Type).HasConversion<string>();
        b.Entity<Installation>().Property(i => i.Latitude).HasPrecision(9, 6);
        b.Entity<Installation>().Property(i => i.Longitude).HasPrecision(9, 6);
        b.Entity<Installation>().Property(i => i.RatedPowerKw).HasPrecision(10, 2);
        b.Entity<Measurement>().Property(m => m.ProductionKwh).HasPrecision(12, 3);
        b.Entity<Measurement>().Property(m => m.Temperature).HasPrecision(6, 2);
        b.Entity<Measurement>().HasIndex(m => new { m.DeviceId, m.Timestamp });
    }
}
