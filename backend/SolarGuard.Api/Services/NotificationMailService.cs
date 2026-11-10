namespace SolarGuard.Api.Services;

public class NotificationMailService(IServiceScopeFactory scopes, ILogger<NotificationMailService> logger) : BackgroundService
{
    // Kritični alarm mora do lastnika v 5 minutah, nalog do serviserja v 1 minuti: 30 s je še v mejah obeh.
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(30);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);
        do
        {
            try
            {
                using var scope = scopes.CreateScope();
                await scope.ServiceProvider.GetRequiredService<NotificationMailer>().Run(DateTime.UtcNow, stoppingToken);
            }
            catch (Exception e) when (e is not OperationCanceledException)
            {
                logger.LogError(e, "Pošiljanje e-pošte obvestil ni uspelo");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
