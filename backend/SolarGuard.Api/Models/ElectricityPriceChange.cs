namespace SolarGuard.Api.Models;

public class ElectricityPriceChange : Entity
{
    public Guid InstallationId { get; set; }
    public decimal PricePerKwh { get; set; }
    public DateTime ValidFrom { get; set; }
}
