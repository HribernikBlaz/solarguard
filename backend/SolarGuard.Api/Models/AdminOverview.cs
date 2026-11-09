namespace SolarGuard.Api.Models;

public record OrderCounts(int Open, int Assigned, int InProgress, int Completed);

public record AdminInstallationView(
    Guid Id,
    string Name,
    string Address,
    decimal RatedPowerKw,
    string? OwnerName,
    string? OwnerEmail,
    int DeviceCount,
    DateTime? LastMeasurementAt,
    int OpenOrders,
    bool Active);

public record AdminOverview(int Installations, int Devices, int Users, int ActiveUsers, OrderCounts Orders, List<AdminInstallationView> Systems);
