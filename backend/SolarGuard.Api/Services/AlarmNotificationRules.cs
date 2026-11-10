namespace SolarGuard.Api.Services;

public static class AlarmNotificationRules
{
    public static string CriticalAlarmMessage(string installationName, string deviceLabel, string description) =>
        $"Kritični alarm na sistemu {installationName}, {deviceLabel}: {description}";

    public static string ServiceOrderMessage(string installationName, string orderDescription) =>
        $"Nov servisni nalog za sistem {installationName}: {orderDescription}";

    public static string AlarmKey(Guid alarmId, Guid userId) => $"alarm:{alarmId}:{userId}";

    public static string ServiceOrderKey(Guid orderId, Guid userId) => $"service-order:{orderId}:{userId}";
}
