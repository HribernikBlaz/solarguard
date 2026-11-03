namespace SolarGuard.Api.Models;

public record ServiceOrderView(
    Guid Id,
    Guid InstallationId,
    string InstallationName,
    string InstallationAddress,
    DeviceType DeviceType,
    string SerialNumber,
    AlarmSeverity Severity,
    string Description,
    ServiceOrderStatus Status,
    Guid? AssigneeId,
    string? AssigneeName,
    DateTime CreatedAt,
    DateTime? ClosedAt);

public record TechnicianView(Guid Id, string Name);
