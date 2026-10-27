import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CrudPage } from './crud-page';
import { DEVICES } from './pages';

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
});
