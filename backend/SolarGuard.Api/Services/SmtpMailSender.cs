using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace SolarGuard.Api.Services;

public class SmtpMailSender(IOptions<SmtpOptions> options) : IMailSender
{
    private const int TimeoutMilliseconds = 15_000;

    private readonly SmtpOptions smtp = options.Value;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(smtp.Host) && !string.IsNullOrWhiteSpace(smtp.From);

    public async Task Send(string to, string subject, string body, CancellationToken cancellationToken)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("SolarGuard", smtp.From));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient { Timeout = TimeoutMilliseconds };
        await client.ConnectAsync(smtp.Host, smtp.Port, SecureSocketOptions.Auto, cancellationToken);
        if (!string.IsNullOrEmpty(smtp.User))
            await client.AuthenticateAsync(smtp.User, smtp.Password, cancellationToken);

        await client.SendAsync(new SendRequest(message), cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
