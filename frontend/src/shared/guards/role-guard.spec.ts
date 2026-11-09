import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { ROLES } from '../constants/roles';
import { roleGuard } from './role-guard';

describe('roleGuard', () => {
  const run = (role: string, ...allowed: string[]) => {
    localStorage.setItem('solarguard.session', JSON.stringify({ token: 't', expiresAt: '2999-01-01T00:00:00Z', email: 'a@b.si', name: 'Ana', role }));
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    return TestBed.runInInjectionContext(() => roleGuard(...allowed)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  };

  beforeEach(() => localStorage.clear());

  it('lets an allowed role through', () => {
    expect(run(ROLES.admin, ROLES.admin)).toBe(true);
  });

  it('sends a technician to the service orders', () => {
    const result = run(ROLES.technician, ROLES.owner, ROLES.admin) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/servisni-nalogi');
  });

  it('sends an owner home from an admin-only page', () => {
    const result = run(ROLES.owner, ROLES.admin) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/');
  });
});
