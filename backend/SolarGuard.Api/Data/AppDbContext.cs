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
    public DbSet<Alarm> Alarms => Set<Alarm>();
    public DbSet<ServiceOrder> ServiceOrders => Set<ServiceOrder>();
    public DbSet<ServiceOrderChange> ServiceOrderChanges => Set<ServiceOrderChange>();
    public DbSet<ElectricityPriceChange> ElectricityPriceChanges => Set<ElectricityPriceChange>();
    public DbSet<Notification> Notifications => Set<Notification>();

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
        b.Entity<Installation>().HasOne<AppUser>().WithMany().HasForeignKey(i => i.TechnicianId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Device>().HasIndex(d => new { d.InstallationId, d.SerialNumber }).IsUnique();
        b.Entity<Installation>().HasMany<Device>().WithOne().HasForeignKey(d => d.InstallationId);
        b.Entity<Device>().HasMany<Measurement>().WithOne().HasForeignKey(m => m.DeviceId);
        b.Entity<Device>().HasMany<Alarm>().WithOne().HasForeignKey(a => a.DeviceId);
        b.Entity<Device>().Property(d => d.Type).HasConversion<string>();
        b.Entity<Alarm>().Property(a => a.Type).HasConversion<string>();
        b.Entity<Alarm>().Property(a => a.Severity).HasConversion<string>();
        b.Entity<Alarm>().Property(a => a.Status).HasConversion<string>();
        b.Entity<Alarm>().HasIndex(a => new { a.DeviceId, a.DetectedAt });
        b.Entity<ServiceOrder>().HasOne<Alarm>().WithMany().HasForeignKey(o => o.AlarmId);
        b.Entity<ServiceOrder>().HasOne<Installation>().WithMany().HasForeignKey(o => o.InstallationId);
        b.Entity<ServiceOrder>().HasOne<AppUser>().WithMany().HasForeignKey(o => o.AssigneeId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<ServiceOrder>().Property(o => o.Status).HasConversion<string>().IsConcurrencyToken();
        b.Entity<ServiceOrder>().Property(o => o.Summary).HasMaxLength(ServiceOrder.MaxSummaryLength);
        b.Entity<ServiceOrderChange>().HasOne<ServiceOrder>().WithMany().HasForeignKey(c => c.ServiceOrderId);
        b.Entity<ServiceOrderChange>().HasOne<AppUser>().WithMany().HasForeignKey(c => c.ChangedById).OnDelete(DeleteBehavior.Restrict);
        b.Entity<ServiceOrderChange>().Property(c => c.Status).HasConversion<string>();
        b.Entity<ServiceOrderChange>().HasIndex(c => new { c.ServiceOrderId, c.ChangedAt });
        b.Entity<ServiceOrder>().HasIndex(o => o.AlarmId).IsUnique();
        b.Entity<ServiceOrder>().HasIndex(o => new { o.AssigneeId, o.Status });
        b.Entity<Alarm>().HasIndex(a => new { a.DeviceId, a.Type, a.Severity }).IsUnique().HasFilter("\"Status\" = 'Active'");
        b.Entity<Installation>().Property(i => i.Latitude).HasPrecision(9, 6);
        b.Entity<Installation>().Property(i => i.Longitude).HasPrecision(9, 6);
        b.Entity<Installation>().Property(i => i.RatedPowerKw).HasPrecision(10, 2);
        b.Entity<Installation>().Property(i => i.ElectricityPrice).HasPrecision(8, 4);
        b.Entity<ElectricityPriceChange>().Property(c => c.PricePerKwh).HasPrecision(8, 4);
        b.Entity<ElectricityPriceChange>().HasOne<Installation>().WithMany().HasForeignKey(c => c.InstallationId);
        b.Entity<ElectricityPriceChange>().HasIndex(c => new { c.InstallationId, c.ValidFrom });
        b.Entity<Notification>().HasOne<AppUser>().WithMany().HasForeignKey(n => n.UserId);
        b.Entity<Notification>().Property(n => n.Kind).HasConversion<string>();
        b.Entity<Notification>().HasIndex(n => new { n.UserId, n.CreatedAt });
        b.Entity<Notification>().HasIndex(n => n.DedupeKey).IsUnique();
        b.Entity<Measurement>().Property(m => m.ProductionKwh).HasPrecision(12, 3);
        b.Entity<Measurement>().Property(m => m.Temperature).HasPrecision(6, 2);
        b.Entity<Measurement>().HasIndex(m => new { m.DeviceId, m.Timestamp });
    }
}
