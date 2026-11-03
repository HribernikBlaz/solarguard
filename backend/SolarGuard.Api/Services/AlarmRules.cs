using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public static class AlarmRules
{
    public const double WarningDeviation = 0.2;
    public const double CriticalDeviation = 0.5;
    public const int ConsecutiveHours = 3;
    public const double MinExpectedKwh = 0.5;

    public static readonly TimeSpan MaxMeasurementGap = TimeSpan.FromHours(2);

    public static bool IsMissing(DateTime? lastMeasurement, DateOnly installedOn, DateTime now)
    {
        if (lastMeasurement is null)
            return installedOn < DateOnly.FromDateTime(now);

        return now - lastMeasurement.Value > MaxMeasurementGap;
    }

    public static AlarmSeverity? LowProduction(IReadOnlyList<(double Actual, double Expected)> hours)
    {
        if (hours.Count < ConsecutiveHours || hours.Any(h => h.Expected < MinExpectedKwh))
            return null;

        var smallestDeviation = hours.Min(h => (h.Expected - h.Actual) / h.Expected);
        if (smallestDeviation > CriticalDeviation)
            return AlarmSeverity.Critical;

        if (smallestDeviation > WarningDeviation)
            return AlarmSeverity.Warning;

        return null;
    }
}
