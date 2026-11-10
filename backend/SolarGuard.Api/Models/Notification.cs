namespace SolarGuard.Api.Models;

public enum NotificationKind
{
    WarrantyExpiring,
    CriticalAlarm,
    ServiceOrderAssigned,
    ProductionMilestone
}

public enum EmailStatus
{
    Pending,
    Sent,
    Failed
}

public class Notification : Entity
{
    public const int MaxEmailErrorLength = 500;

    public Guid UserId { get; set; }
    public NotificationKind Kind { get; set; }
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    // Isti dogodek se uporabniku ne sme javiti dvakrat, tudi če se preverjanje ponovi.
    public string DedupeKey { get; set; } = "";
    public EmailStatus EmailStatus { get; set; }
    public int EmailAttempts { get; set; }
    public DateTime? EmailAttemptedAt { get; set; }
    public DateTime? EmailSentAt { get; set; }
    public string? EmailError { get; set; }

    public static Notification Create(Guid userId, NotificationKind kind, string message, string dedupeKey, DateTime now) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Kind = kind,
        Message = message,
        CreatedAt = now,
        DedupeKey = dedupeKey,
    };
}

public record NotificationView(Guid Id, NotificationKind Kind, string Message, DateTime CreatedAt, EmailStatus EmailStatus);

// Kritičnih alarmov ni mogoče izklopiti, zato je CriticalAlarms vedno true.
public record NotificationSettings(bool Milestones, bool CriticalAlarms);

public record NotificationSettingsRequest
{
    public required bool Milestones { get; init; }
}
