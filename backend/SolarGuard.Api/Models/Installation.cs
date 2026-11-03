namespace SolarGuard.Api.Models;

public class Installation : Entity
{
    public Guid? OwnerId { get; set; }
    public Guid? TechnicianId { get; set; }
    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public DateOnly InstallationDate { get; set; }
    public decimal RatedPowerKw { get; set; }
}
