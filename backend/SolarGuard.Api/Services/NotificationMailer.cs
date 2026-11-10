using Microsoft.EntityFrameworkCore;
using SolarGuard.Api.Data;
using SolarGuard.Api.Models;

namespace SolarGuard.Api.Services;

// shortcut: pošilja samo en proces API-ja; za več instanc bi bilo treba vrstice zakleniti (FOR UPDATE SKIP LOCKED).
public class NotificationMailer(AppDbContext db, IMailSender sender, ILogger<NotificationMailer> logger)
{
    public const int MaxAttempts = 5;
    public static readonly TimeSpan RetryDelay = TimeSpan.FromMinutes(1);

    private const int BatchSize = 50;

    public async Task Run(DateTime now, CancellationToken cancellationToken)
    {
        var retryBefore = now - RetryDelay;
        var due = await (from n in db.Notifications
                         join u in db.Users on n.UserId equals u.Id
                         where n.EmailStatus == EmailStatus.Pending && (n.EmailAttemptedAt == null || n.EmailAttemptedAt <= retryBefore)
                         orderby n.CreatedAt
                         select new { Notification = n, u.Email })
            .Take(BatchSize)
            .ToListAsync(cancellationToken);

        if (due.Count > 0 && !sender.IsConfigured)
            logger.LogWarning("SMTP ni nastavljen, e-pošta za {Count} obvestil ne bo poslana (obvestila ostanejo v aplikaciji)", due.Count);

        foreach (var item in due)
        {
            await Deliver(item.Notification, item.Email, cancellationToken);
            // Po vsakem obvestilu, da ob prekinitvi poslanega ne pošljemo še enkrat; ob napaki shranjevanja je dostava vsaj enkrat.
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task Deliver(Notification notification, string? email, CancellationToken cancellationToken)
    {
        if (!sender.IsConfigured)
        {
            Fail(notification, "Pošiljanje e-pošte ni nastavljeno.", final: true);

            return;
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            Fail(notification, "Uporabnik nima e-poštnega naslova.", final: true);

            return;
        }

        try
        {
            await sender.Send(email, Subject(notification.Kind), notification.Message, cancellationToken);
            notification.EmailStatus = EmailStatus.Sent;
            notification.EmailAttempts++;
            notification.EmailAttemptedAt = DateTime.UtcNow;
            notification.EmailSentAt = notification.EmailAttemptedAt;
            notification.EmailError = null;
        }
        catch (Exception e) when (e is not OperationCanceledException)
        {
            logger.LogWarning(e, "E-pošte za obvestilo {Notification} ni bilo mogoče poslati (poskus {Attempt})", notification.Id, notification.EmailAttempts + 1);
            Fail(notification, e.Message, final: false);
        }
    }

    private static void Fail(Notification notification, string error, bool final)
    {
        notification.EmailAttempts++;
        notification.EmailAttemptedAt = DateTime.UtcNow;
        notification.EmailError = error.Length > Notification.MaxEmailErrorLength ? error[..Notification.MaxEmailErrorLength] : error;
        if (final || notification.EmailAttempts >= MaxAttempts)
            notification.EmailStatus = EmailStatus.Failed;
    }

    private static string Subject(NotificationKind kind) => kind switch
    {
        NotificationKind.CriticalAlarm => "SolarGuard: kritični alarm",
        NotificationKind.ServiceOrderAssigned => "SolarGuard: nov servisni nalog",
        NotificationKind.ProductionMilestone => "SolarGuard: mejnik proizvodnje",
        NotificationKind.WarrantyExpiring => "SolarGuard: garancija naprave poteče",
        _ => "SolarGuard: obvestilo",
    };
}
