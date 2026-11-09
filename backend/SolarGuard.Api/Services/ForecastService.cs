using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

public class ForecastService(OpenMeteoClient openMeteo)
{
    public const int MaxDays = 14;

    public async Task<Forecast> Get(Installation installation, int days, DateTime now)
    {
        if (installation.Latitude == 0 && installation.Longitude == 0)
            return Unavailable("Lokacija sistema ni nastavljena, napovedi ni mogoče izračunati.");

        var weather = await openMeteo.GetWeather(installation.Latitude, installation.Longitude);
        if (weather is null)
            return Unavailable("Vremenska napoved za lokacijo sistema trenutno ni na voljo.");

        return ForecastRules.Calculate(weather, installation.RatedPowerKw, now, days);
    }

    private static Forecast Unavailable(string warning) => new([], 0, warning);
}
