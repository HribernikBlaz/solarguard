import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationsView } from './notifications-view';

describe('NotificationsView', () => {
  const setup = () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(NotificationsView);
    fixture.detectChanges();

    return { http, fixture, el: fixture.nativeElement as HTMLElement };
  };

  it('lists the notifications with their kind and email status', async () => {
    const { http, fixture, el } = setup();

    http.expectOne('/api/notifications').flush([
      { id: 'n1', kind: 'WarrantyExpiring', message: 'Garancija naprave Inverter X poteče 20.11.2026 (čez 11 dni).', createdAt: '2026-11-09T10:00:00Z', emailStatus: 'Sent' },
      { id: 'n2', kind: 'CriticalAlarm', message: 'Kritični alarm na sistemu Hiša Novak', createdAt: '2026-11-09T11:00:00Z', emailStatus: 'Failed' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.textContent).toContain('Garancija naprave Inverter X');
    expect(el.textContent).toContain('Garancija');
    expect(el.textContent).toContain('Poslana');
    expect(el.textContent).toContain('Ni dostavljena');
  });

  it('says there are none when the list is empty', async () => {
    const { http, fixture, el } = setup();

    http.expectOne('/api/notifications').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.textContent).toContain('Ni obvestil.');
  });

  it('shows an error when the first load fails', async () => {
    const { http, fixture, el } = setup();

    http.expectOne('/api/notifications').flush('Napaka', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('.error')).not.toBeNull();
  });
});
