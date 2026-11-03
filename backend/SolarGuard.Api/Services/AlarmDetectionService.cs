namespace SolarGuard.Api.Services;

public class AlarmDetectionService(IServiceScopeFactory scopes, ILogger<AlarmDetectionService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));
        do
        {
            try
            {
                using var scope = scopes.CreateScope();
                await scope.ServiceProvider.GetRequiredService<AlarmDetector>().Run(DateTime.UtcNow);
            }
            catch (Exception e) when (e is not OperationCanceledException)
            {
                logger.LogError(e, "Zaznavanje odstopanj ni uspelo");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
