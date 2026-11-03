import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { Field } from '../../shared/models/field';
import { PageConfig } from '../../shared/models/page-config';
import { fromLocalInput, toLocalInput } from '../../shared/utils/datetime';

@Component({
  selector: 'app-crud-page',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './crud-page.html',
})
export class CrudPage implements OnInit {
  readonly config = input.required<PageConfig>();
  private readonly loaded = signal<any[]>([]);
  protected readonly filterValue = signal('');
  protected readonly newestFirst = signal(true);
  protected readonly rows = computed(() => {
    const { filter, sortBy } = this.config();
    let rows = this.loaded();

    if (filter && this.filterValue()) {
      rows = rows.filter((r) => r[filter.key] === this.filterValue());
    }
    if (!sortBy) {
      return rows;
    }

    const dir = this.newestFirst() ? 1 : -1;

    return [...rows].sort((a, b) => (a[sortBy] < b[sortBy] ? dir : -dir));
  });
  protected readonly refs = signal<Record<string, any[]>>({});
  protected readonly form = signal<any>(null);
  protected readonly error = signal('');
  protected readonly fields = computed(() => this.config().fields.filter((f) => !f.adminOnly || this.isAdmin()));
  protected readonly toLocal = toLocalInput;
  protected readonly fromLocal = (v: string) => (v ? fromLocalInput(v) : '');
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly isAdmin = computed(() => this.auth.session()?.role === 'Admin');

  ngOnInit() {
    this.load();
  }

  private url(id?: string) {
    return `/api/${this.config().path}${id ? '/' + id : ''}`;
  }

  private fail = (e: any) => this.error.set(typeof e.error === 'string' && e.error ? e.error : `Napaka ${e.status}`);

  private load() {
    const refPaths = [...new Set(this.fields().flatMap((f) => (f.ref ? [f.ref.path] : [])))];
    forkJoin({
      rows: this.http.get<any[]>(this.url()),
      refs: refPaths.length ? forkJoin(Object.fromEntries(refPaths.map((p) => [p, this.http.get<any[]>(`/api/${p}`)]))) : of({}),
    }).subscribe({
      next: ({ rows, refs }) => {
        this.loaded.set(rows);
        this.refs.set(refs as Record<string, any[]>);
        this.error.set('');
      },
      error: this.fail,
    });
  }

  protected show(row: any, f: Field) {
    const ref = f.ref;
    if (!ref) {
      return row[f.key];
    }
    if (!row[f.key]) {
      return '–';
    }

    const target = this.refs()[ref.path]?.find((r) => r.id === row[f.key]);

    return target ? ref.label(target) : row[f.key];
  }

  protected add() {
    this.form.set(this.config().empty());
  }

  protected edit(row: any) {
    this.form.set({ ...row });
  }

  protected save() {
    const body = this.form();
    const req = body.id ? this.http.put(this.url(body.id), body) : this.http.post(this.url(), body);
    req.subscribe({
      next: () => {
        this.form.set(null);
        this.load();
      },
      error: this.fail,
    });
  }

  protected remove(row: any) {
    if (!confirm('Res želite izbrisati zapis?')) {
      return;
    }

    this.http.delete(this.url(row.id)).subscribe({ next: () => this.load(), error: this.fail });
  }
}
