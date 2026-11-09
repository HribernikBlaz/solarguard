import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Savings } from '../../services/dtos/savings';
import { SavingsCard } from './savings-card';

const savings = (pricePerKwh: number | null): Savings =>
  pricePerKwh === null
    ? { pricePerKwh, day: null, month: null, year: null, total: null }
    : { pricePerKwh, day: 1.5, month: 24.79, year: 93.29, total: 120.4 };

describe('SavingsCard', () => {
  const setup = async (id = 'a') => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SavingsCard);
    fixture.componentRef.setInput('installationId', id);
    fixture.detectChanges();
    TestBed.tick();

    return { http, fixture, el: fixture.nativeElement as HTMLElement };
  };

  const show = async (fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('asks for the price instead of showing amounts when it is missing', async () => {
    const { http, fixture, el } = await setup();

    http.expectOne('/api/installations/a/savings').flush(savings(null));
    await show(fixture);

    expect(el.textContent).toContain('Cena elektrike ni vnesena');
    expect(el.textContent).not.toContain('€');
  });

  it('shows the selected period and the total since installation', async () => {
    const { http, fixture, el } = await setup();
    http.expectOne('/api/installations/a/savings').flush(savings(0.2));
    await show(fixture);

    expect(el.textContent).toContain('Danes');
    expect(el.textContent).toContain('1.50 €');
    expect(el.textContent).toContain('120.40 €');

    [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Leto')!.click();
    fixture.detectChanges();

    expect(el.textContent).toContain('93.29 €');
  });

  it('says so when the first load fails', async () => {
    const { http, fixture, el } = await setup();

    http.expectOne('/api/installations/a/savings').flush('x', { status: 500, statusText: 'Server Error' });
    await show(fixture);

    expect(el.textContent).toContain('Prihranka ni mogoče naložiti.');
  });

  it('does not show the previous system while the next one is loading', async () => {
    const { http, fixture, el } = await setup();
    http.expectOne('/api/installations/a/savings').flush(savings(0.2));
    await show(fixture);

    fixture.componentRef.setInput('installationId', 'b');
    fixture.detectChanges();
    TestBed.tick();
    await show(fixture);

    expect(el.textContent).toContain('Nalagam');
    expect(el.textContent).not.toContain('120.40 €');
    http.expectOne('/api/installations/b/savings').flush(savings(null));
  });
});
