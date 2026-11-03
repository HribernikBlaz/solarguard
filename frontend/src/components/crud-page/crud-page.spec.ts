import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DEVICES } from '../../shared/constants/pages';
import { CrudPage } from './crud-page';

describe('CrudPage', () => {
  it('lists rows and shows the referenced installation name', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CrudPage);
    fixture.componentRef.setInput('config', DEVICES);
    fixture.detectChanges();

    http.expectOne('/api/devices').flush([
      { id: 'd1', installationId: 'i1', type: 'Panel', manufacturer: 'Fronius', model: 'Primo', serialNumber: 'X1', warrantyUntil: '2030-01-01' },
    ]);
    http.expectOne('/api/installations').flush([{ id: 'i1', name: 'Streha' }]);
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Streha');
    expect(text).toContain('Fronius');
    expect(text).toContain('01.01.2030');
  });

  it('filters devices by type and reverses the sort order', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CrudPage);
    fixture.componentRef.setInput('config', DEVICES);
    fixture.detectChanges();

    const dev = (id: string, type: string, installedOn: string) => ({
      id, installationId: 'i1', type, manufacturer: id, model: 'M', serialNumber: id, installedOn, warrantyUntil: '2030-01-01',
    });
    http.expectOne('/api/devices').flush([dev('Stara', 'Panel', '2020-01-01'), dev('Nova', 'Panel', '2024-01-01'), dev('Razsmernik', 'Inverter', '2022-01-01')]);
    http.expectOne('/api/installations').flush([{ id: 'i1', name: 'Streha' }]);
    await fixture.whenStable();

    const order = () => [...fixture.nativeElement.querySelectorAll('tbody tr')].map((r: HTMLElement) => r.children[2].textContent!.trim());
    expect(order()).toEqual(['Nova', 'Razsmernik', 'Stara']);

    fixture.componentInstance['filterValue'].set('Panel');
    fixture.componentInstance['newestFirst'].set(false);
    fixture.detectChanges();
    expect(order()).toEqual(['Stara', 'Nova']);
  });
});
