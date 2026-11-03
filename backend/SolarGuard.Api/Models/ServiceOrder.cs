namespace SolarGuard.Api.Models;

public enum ServiceOrderStatus
{
    Open,
    Assigned,
    InProgress,
    Completed
}

public class ServiceOrder : Entity
{
    public Guid AlarmId { get; set; }
    public Guid InstallationId { get; set; }
    public Guid? AssigneeId { get; set; }
    public ServiceOrderStatus Status { get; set; }
    public string Description { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
}
