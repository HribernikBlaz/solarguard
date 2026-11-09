namespace SolarGuard.Api.Services;

public class WarrantyCheckService(IServiceScopeFactory scopes, ILogger<WarrantyCheckService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromDays(1));
        do
        {
            try
            {
                using var scope = scopes.CreateScope();
                await scope.ServiceProvider.GetRequiredService<WarrantyChecker>().Run(DateTime.UtcNow);
            }
            catch (Exception e) when (e is not OperationCanceledException)
            {
                logger.LogError(e, "Preverjanje garancij ni uspelo");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
