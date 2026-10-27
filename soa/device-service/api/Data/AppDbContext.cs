using DeviceService.Models;
using Microsoft.EntityFrameworkCore;

namespace DeviceService.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Device> Devices => Set<Device>();

    protected override void OnModelCreating(ModelBuilder b) =>
        b.Entity<Device>().Property(d => d.Type).HasConversion<string>();
}
