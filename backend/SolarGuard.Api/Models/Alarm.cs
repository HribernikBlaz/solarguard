namespace SolarGuard.Api.Models;

public enum AlarmType
{
    LowProduction,
    MissingMeasurements
}

public enum AlarmSeverity
{
    Warning,
    Critical
}

public enum AlarmStatus
{
    Active,
    Resolved
}

public class Alarm : Entity
{
    public Guid DeviceId { get; set; }
    public AlarmType Type { get; set; }
    public AlarmSeverity Severity { get; set; }
    public AlarmStatus Status { get; set; }
    public DateTime DetectedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string Description { get; set; } = "";
}
