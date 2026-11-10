namespace SolarGuard.Api.Services;

public interface IMailSender
{
    bool IsConfigured { get; }

    Task Send(string to, string subject, string body, CancellationToken cancellationToken);
}
