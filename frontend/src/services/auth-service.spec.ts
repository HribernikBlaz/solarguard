import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';
import { Session } from './dtos/session';

const session = (expiresAt: string): Session => ({
  token: 't',
  expiresAt,
  email: 'a@b.si',
  name: 'Ana Novak',
  role: 'Lastnik',
});

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('ignores a stored session that has expired', () => {
    localStorage.setItem('solarguard.session', JSON.stringify(session('2000-01-01T00:00:00Z')));
    expect(TestBed.inject(AuthService).session()).toBeNull();
  });

  it('keeps the session after login and drops it on logout', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('a@b.si', 'geslo1234').subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/login')
      .flush(session('2999-01-01T00:00:00Z'));
    expect(auth.session()?.name).toBe('Ana Novak');
    expect(localStorage.getItem('solarguard.session')).toContain('Ana Novak');

    auth.logout();
    expect(auth.session()).toBeNull();
    expect(localStorage.getItem('solarguard.session')).toBeNull();
  });
});
