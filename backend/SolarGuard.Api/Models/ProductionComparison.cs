namespace SolarGuard.Api.Models;

public record ProductionPoint(DateTime Start, double ActualKwh, double? ExpectedKwh);

public record ProductionComparison(string Period, List<ProductionPoint> Points, double? DeviationPercent, string? Warning);
