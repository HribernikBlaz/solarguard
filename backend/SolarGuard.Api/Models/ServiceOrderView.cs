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
    DateTime? ClosedAt,
    string? Summary);

public record ServiceOrderChangeView(ServiceOrderStatus Status, DateTime ChangedAt, string ChangedByName);

public record ChangeStatusRequest(ServiceOrderStatus Status, string? Summary);

public record TechnicianView(Guid Id, string Name);
