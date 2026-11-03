namespace SolarGuard.Api.Services;

public static class ProductionRules
{
    public const double PerformanceRatio = 0.8;

    public static double ExpectedKwh(double irradianceWm2, decimal ratedPowerKw) =>
        irradianceWm2 / 1000 * (double)ratedPowerKw * PerformanceRatio;
}
