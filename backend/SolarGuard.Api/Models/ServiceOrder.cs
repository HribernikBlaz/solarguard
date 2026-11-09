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
    public const int MaxSummaryLength = 1000;

    public Guid AlarmId { get; set; }
    public Guid InstallationId { get; set; }
    public Guid? AssigneeId { get; set; }
    public ServiceOrderStatus Status { get; set; }
    public string Description { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string? Summary { get; set; }
}

public class ServiceOrderChange : Entity
{
    public Guid ServiceOrderId { get; set; }
    public ServiceOrderStatus Status { get; set; }
    public DateTime ChangedAt { get; set; }
    public Guid ChangedById { get; set; }
}
