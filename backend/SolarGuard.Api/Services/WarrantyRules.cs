using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public static class WarrantyRules
{
    public const int WarningDays = 30;

    public static string Message(DeviceType type, string serialNumber, string installationName, DateOnly warrantyUntil, DateOnly today)
    {
        var daysLeft = warrantyUntil.DayNumber - today.DayNumber;

        return $"Garancija naprave {type} {serialNumber} ({installationName}) poteče {warrantyUntil:dd.MM.yyyy} (čez {daysLeft} dni).";
    }

    public static string DedupeKey(Guid deviceId, DateOnly warrantyUntil, Guid userId) =>
        $"warranty:{deviceId}:{warrantyUntil:yyyy-MM-dd}:{userId}";
}
