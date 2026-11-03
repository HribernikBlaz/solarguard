namespace SolarGuard.Api.Services;

public static class Slovenia
{
    private static readonly TimeZoneInfo Zone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Ljubljana");

    public static DateTime ToLocal(DateTime utc) => TimeZoneInfo.ConvertTimeFromUtc(utc, Zone);

    public static DateTime ToUtc(DateTime local) => TimeZoneInfo.ConvertTimeToUtc(local, Zone);
}
