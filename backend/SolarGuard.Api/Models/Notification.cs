namespace SolarGuard.Api.Models;

public enum NotificationKind
{
    WarrantyExpiring
}

public class Notification : Entity
{
    public Guid UserId { get; set; }
    public NotificationKind Kind { get; set; }
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    // Isti dogodek se uporabniku ne sme javiti dvakrat, tudi če se preverjanje ponovi.
    public string DedupeKey { get; set; } = "";
}

public record NotificationView(Guid Id, NotificationKind Kind, string Message, DateTime CreatedAt);
