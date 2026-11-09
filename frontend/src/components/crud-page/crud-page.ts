import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { ROLES } from '../../shared/constants/roles';
import { errorText } from '../../shared/http/error-text';
import { Field } from '../../shared/models/field';
import { PageConfig } from '../../shared/models/page-config';
import { fromLocalInput, toLocalInput } from '../../shared/utils/datetime';
import { pagedList } from '../../shared/utils/paging';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { Dialog } from '../dialog/dialog';
import { Pager } from '../pager/pager';

type Row = Record<string, any>;

@Component({
  selector: 'app-crud-page',
  imports: [FormsModule, DatePipe, RouterLink, Dialog, ConfirmDialog, Pager],
  templateUrl: './crud-page.html',
})
export class CrudPage implements OnInit {
  readonly config = input.required<PageConfig>();
  protected readonly filterValue = signal('');
  protected readonly search = signal('');
  protected readonly newestFirst = signal(true);
  protected readonly refs = signal<Record<string, Row[]>>({});
  protected readonly ready = signal(false);
  protected readonly error = signal('');
  protected readonly form = signal<Row | null>(null);
  protected readonly formError = signal('');
  protected readonly saving = signal(false);
  protected readonly pendingDelete = signal<Row | null>(null);
  protected readonly deleteError = signal('');
  protected readonly deleting = signal(false);
  protected readonly toLocal = toLocalInput;
  protected readonly fromLocal = (v: string) => (v ? fromLocalInput(v) : '');
  private readonly loaded = signal<Row[]>([]);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private reads = 0;

  protected readonly fields = computed(() => {
    const role = this.auth.session()?.role ?? '';

    return this.config().fields.filter((f) => (!f.adminOnly || this.isAdmin()) && !f.hiddenFor?.includes(role));
  });
  protected readonly canWrite = computed(() => this.config().writeRoles.includes(this.auth.session()?.role ?? ''));
  protected readonly formTitle = computed(() => `${this.form()?.['id'] ? 'Uredi' : 'Dodaj'} ${this.config().itemName}`);

  protected readonly rows = computed(() => {
    const { filter, sortBy } = this.config();
    const query = this.search().trim().toLowerCase();
    let rows = this.loaded();

    if (filter && this.filterValue()) {
      rows = rows.filter((r) => r[filter.key] === this.filterValue());
    }
    if (query) {
      rows = rows.filter((r) => this.text(r).includes(query));
    }
    if (!sortBy) {
      return rows;
    }

    const dir = this.newestFirst() ? 1 : -1;

    return [...rows].sort((a, b) => (a[sortBy] < b[sortBy] ? dir : -dir));
  });
  protected readonly paged = pagedList(this.rows);
  private readonly isAdmin = computed(() => this.auth.session()?.role === ROLES.admin);

  ngOnInit() {
    this.load();
  }

  protected show(row: Row, f: Field) {
    const ref = f.ref;
    if (!ref) {
      return row[f.key];
    }
    if (!row[f.key]) {
      return '–';
    }

    const target = this.refs()[ref.path]?.find((r) => r['id'] === row[f.key]);

    return target ? ref.label(target) : row[f.key];
  }

  protected setFilter(value: string) {
    this.filterValue.set(value);
    this.paged.page.set(1);
  }

  protected setSearch(value: string) {
    this.search.set(value);
    this.paged.page.set(1);
  }

  protected toggleSort() {
    this.newestFirst.set(!this.newestFirst());
    this.paged.page.set(1);
  }

  protected add() {
    this.formError.set('');
    this.form.set(this.config().empty());
  }

  protected edit(row: Row) {
    this.formError.set('');
    this.form.set({ ...row });
  }

  protected closeForm() {
    if (!this.saving()) {
      this.form.set(null);
    }
  }

  protected save() {
    const body = this.form();
    if (!body || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.set('');
    const req = body['id'] ? this.http.put(this.url(body['id']), body) : this.http.post(this.url(), body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.form.set(null);
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(errorText(e));
      },
    });
  }

  protected askDelete(row: Row) {
    this.deleteError.set('');
    this.pendingDelete.set(row);
  }

  protected cancelDelete() {
    if (!this.deleting()) {
      this.pendingDelete.set(null);
    }
  }

  protected deleteMessage(row: Row) {
    const first = this.fields()[0];

    return `Res želite izbrisati "${first ? this.show(row, first) : row['id']}"?`;
  }

  protected confirmDelete(row: Row) {
    if (this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.http.delete(this.url(row['id'])).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.load();
      },
      error: (e) => {
        this.deleting.set(false);
        this.deleteError.set(errorText(e));
      },
    });
  }

  private url(id?: string) {
    return `/api/${this.config().path}${id ? '/' + id : ''}`;
  }

  private text(row: Row) {
    return this.fields()
      .map((f) => this.show(row, f))
      .join(' ')
      .toLowerCase();
  }

  private load() {
    const read = ++this.reads;
    const refPaths = [...new Set(this.fields().flatMap((f) => (f.ref ? [f.ref.path] : [])))];
    forkJoin({
      rows: this.http.get<Row[]>(this.url()),
      refs: refPaths.length ? forkJoin(Object.fromEntries(refPaths.map((p) => [p, this.http.get<Row[]>(`/api/${p}`)]))) : of({}),
    }).subscribe({
      next: ({ rows, refs }) => {
        if (read !== this.reads) {
          return;
        }

        this.loaded.set(rows);
        this.refs.set(refs as Record<string, Row[]>);
        this.ready.set(true);
        this.error.set('');
      },
      error: (e) => {
        if (read === this.reads) {
          this.error.set(errorText(e));
        }
      },
    });
  }
}
