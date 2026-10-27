namespace DeviceService.Models;

public enum DeviceType
{
    Panel,
    Inverter
}

public class Device
{
    public Guid Id { get; set; }
    public DeviceType Type { get; set; }
    public string Manufacturer { get; set; } = "";
    public string Model { get; set; } = "";
    public string SerialNumber { get; set; } = "";
    public DateOnly WarrantyUntil { get; set; }
}
