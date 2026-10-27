namespace SolarGuard.Api.Models;

public class Measurement : Entity
{
    public Guid DeviceId { get; set; }
    public DateTime Timestamp { get; set; }
    public decimal ProductionKwh { get; set; }
    public decimal Temperature { get; set; }
    public bool HasError { get; set; }
}
