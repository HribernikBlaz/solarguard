namespace SolarGuard.Api.Models;

public record AlarmView(
    Guid Id,
    Guid InstallationId,
    string InstallationName,
    Guid DeviceId,
    DeviceType DeviceType,
    string SerialNumber,
    AlarmType Type,
    AlarmSeverity Severity,
    AlarmStatus Status,
    DateTime DetectedAt,
    DateTime? ResolvedAt,
    string Description);
