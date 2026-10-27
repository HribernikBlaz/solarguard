using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Installation> Installations => Set<Installation>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Measurement> Measurements => Set<Measurement>();

    protected override void OnModelCreating(ModelBuilder b)
    {
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
