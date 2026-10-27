import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { fromLocalInput, toLocalInput } from './datetime';
import { Field, PageConfig } from './pages';

@Component({
  selector: 'app-crud-page',
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <h1>{{ config().title }}</h1>
    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (form(); as f) {
      <form (ngSubmit)="save()">
        @for (field of config().fields; track field.key) {
          <label>
            {{ field.label }}
            @switch (field.type) {
              @case ('select') {
                <select [name]="field.key" [(ngModel)]="f[field.key]" required>
                  <option value="" disabled>-- izberi --</option>
                  @if (field.ref; as ref) {
                    @for (r of refs()[ref.path]; track r.id) {
                      <option [value]="r.id">{{ ref.label(r) }}</option>
                    }
                  } @else {
                    @for (o of field.options; track o) {
                      <option [value]="o">{{ o }}</option>
                    }
                  }
                </select>
              }
              @case ('checkbox') {
                <input type="checkbox" [name]="field.key" [(ngModel)]="f[field.key]" />
              }
              @case ('datetime') {
                <input
                  type="datetime-local"
                  [name]="field.key"
                  [ngModel]="toLocal(f[field.key])"
                  (ngModelChange)="f[field.key] = fromLocal($event)"
                  required
                />
              }
              @default {
                <input [type]="field.type" step="any" [name]="field.key" [(ngModel)]="f[field.key]" required />
              }
            }
          </label>
        }
        <div class="buttons">
          <button type="submit">Shrani</button>
          <button type="button" (click)="form.set(null)">Prekliči</button>
        </div>
      </form>
    } @else {
      <button type="button" (click)="add()">Dodaj</button>
    }

    <table>
      <thead>
        <tr>
          @for (field of config().fields; track field.key) {
            <th>{{ field.label }}</th>
          }
          <th></th>
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row.id) {
          <tr>
            @for (field of config().fields; track field.key) {
              <td>
                @switch (field.type) {
                  @case ('datetime') {
                    {{ row[field.key] | date: 'dd.MM.yyyy HH:mm' }}
                  }
                  @case ('date') {
                    {{ row[field.key] | date: 'dd.MM.yyyy' }}
                  }
                  @case ('checkbox') {
                    {{ row[field.key] ? 'Da' : 'Ne' }}
                  }
                  @default {
                    {{ show(row, field) }}
                  }
                }
              </td>
            }
            <td class="buttons">
              @if (config().detail; as detail) {
                <a class="btn" [routerLink]="[detail, row.id]">Podrobnosti</a>
              }
              <button type="button" (click)="edit(row)">Uredi</button>
              <button type="button" (click)="remove(row)">Izbriši</button>
            </td>
          </tr>
        } @empty {
          <tr>
            <td [attr.colspan]="config().fields.length + 1">Ni zapisov.</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class CrudPage implements OnInit {
  readonly config = input.required<PageConfig>();
  protected readonly rows = signal<any[]>([]);
  protected readonly refs = signal<Record<string, any[]>>({});
  protected readonly form = signal<any>(null);
  protected readonly error = signal('');
  protected readonly toLocal = toLocalInput;
  protected readonly fromLocal = (v: string) => (v ? fromLocalInput(v) : '');
  private readonly http = inject(HttpClient);

  ngOnInit() {
    this.load();
  }

  private url(id?: string) {
    return `/api/${this.config().path}${id ? '/' + id : ''}`;
  }

  private fail = (e: any) => this.error.set(typeof e.error === 'string' && e.error ? e.error : `Napaka ${e.status}`);

  private load() {
    const c = this.config();
    const refPaths = [...new Set(c.fields.flatMap((f) => (f.ref ? [f.ref.path] : [])))];
    forkJoin({
      rows: this.http.get<any[]>(this.url()),
      refs: refPaths.length ? forkJoin(Object.fromEntries(refPaths.map((p) => [p, this.http.get<any[]>(`/api/${p}`)]))) : of({}),
    }).subscribe({
      next: ({ rows, refs }) => {
        const key = c.sortBy;
        this.rows.set(key ? rows.sort((a, b) => (a[key] < b[key] ? 1 : -1)) : rows);
        this.refs.set(refs as Record<string, any[]>);
        this.error.set('');
      },
      error: this.fail,
    });
  }

  protected show(row: any, f: Field) {
    const ref = f.ref;
    if (!ref) return row[f.key];
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
    if (!confirm('Res želite izbrisati zapis?')) return;
    this.http.delete(this.url(row.id)).subscribe({ next: () => this.load(), error: this.fail });
  }
}
