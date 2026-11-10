namespace SolarGuard.Api.Services;

public class MilestoneCheckService(IServiceScopeFactory scopes, ILogger<MilestoneCheckService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));
        do
        {
            try
            {
                using var scope = scopes.CreateScope();
                await scope.ServiceProvider.GetRequiredService<MilestoneChecker>().Run(DateTime.UtcNow);
            }
            catch (Exception e) when (e is not OperationCanceledException)
            {
                logger.LogError(e, "Preverjanje mejnikov proizvodnje ni uspelo");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
