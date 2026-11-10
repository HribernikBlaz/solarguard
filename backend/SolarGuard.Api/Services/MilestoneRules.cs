namespace SolarGuard.Api.Services;

public static class MilestoneRules
{
    public static readonly int[] ThresholdsKwh = [1_000, 10_000, 100_000, 1_000_000];

    // Samo najvišji dosežen mejnik: sistem, ki jih je že več preskočil, ne dobi vseh naenkrat.
    public static int? Reached(decimal totalKwh) =>
        ThresholdsKwh.Where(t => totalKwh >= t).Select(t => (int?)t).LastOrDefault();

    public static string Message(string installationName, int thresholdKwh)
    {
        var threshold = thresholdKwh.ToString("N0", System.Globalization.CultureInfo.InvariantCulture).Replace(',', '.');

        return $"Sistem {installationName} je presegel {threshold} kWh skupne proizvodnje.";
    }

    public static string DedupeKey(Guid installationId, int thresholdKwh, Guid userId) =>
        $"milestone:{installationId}:{thresholdKwh}:{userId}";
}
