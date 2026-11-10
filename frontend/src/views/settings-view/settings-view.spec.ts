import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SettingsView } from './settings-view';

describe('SettingsView', () => {
  const setup = async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SettingsView);
    fixture.detectChanges();
    http.expectOne('/api/notifications/settings').flush({ milestones: true, criticalAlarms: true });
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const boxes = Array.from(el.querySelectorAll<HTMLInputElement>('input[type=checkbox]'));

    return { http, fixture, el, critical: boxes[0], milestones: boxes[1] };
  };

  it('does not let the critical alarms be turned off', async () => {
    const { critical } = await setup();

    expect(critical.checked).toBe(true);
    expect(critical.disabled).toBe(true);
  });

  it('saves the milestones switch', async () => {
    const { http, fixture, milestones } = await setup();

    milestones.click();
    const request = http.expectOne('/api/notifications/settings');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ milestones: false });
    request.flush({ milestones: false, criticalAlarms: true });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(milestones.checked).toBe(false);
    expect(milestones.disabled).toBe(false);
  });

  it('puts the switch back and says so when saving fails', async () => {
    const { http, fixture, el, milestones } = await setup();

    milestones.click();
    http.expectOne('/api/notifications/settings').flush('Napaka', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(milestones.checked).toBe(true);
    expect(el.querySelector('.error')).not.toBeNull();
  });
});
