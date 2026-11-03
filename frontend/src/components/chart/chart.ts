import { Component, computed, input } from '@angular/core';

const W = 800;
const H = 280;
const PAD = { l: 52, r: 8, t: 10, b: 28 };

@Component({
  selector: 'app-chart',
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart {
  readonly labels = input.required<string[]>();
  readonly bars = input.required<number[]>();
  readonly line = input<number[]>([]);
  readonly barsLabel = input('Dejansko');
  readonly lineLabel = input('Pričakovano');
  readonly unit = input('kWh');
  readonly titles = input<string[]>([]);
  readonly emptyText = input('Ni podatkov za prikaz grafa.');

  protected readonly W = W;
  protected readonly H = H;
  protected readonly pad = PAD;

  private readonly max = computed(() => {
    const raw = Math.max(0.1, ...this.bars(), ...this.line());
    const mag = 10 ** Math.floor(Math.log10(raw));

    return [1, 2, 5, 10].map((m) => m * mag).find((v) => v >= raw)!;
  });
  private readonly y = (v: number) => PAD.t + (1 - v / this.max()) * (H - PAD.t - PAD.b);

  protected readonly grid = computed(() =>
    [0, 1, 2, 3, 4].map((k) => ({ y: this.y((this.max() * k) / 4), label: ((this.max() * k) / 4).toLocaleString('sl', { maximumFractionDigits: 2 }) })),
  );

  protected readonly cols = computed(() => {
    const n = this.labels().length;
    const w = (W - PAD.l - PAD.r) / n;
    const every = Math.ceil(n / 12);
    const f = (v: number | undefined) => (v ?? 0).toLocaleString('sl', { maximumFractionDigits: 2 });

    return this.labels().map((label, i) => {
      const v = this.bars()[i] ?? 0;
      const x = PAD.l + i * w;

      return {
        i, label, x, w, cx: x + w / 2, show: i % every === 0,
        bx: x + w * 0.2, bw: w * 0.6, by: this.y(v), bh: H - PAD.b - this.y(v),
        tip: `${this.titles()[i] ?? label}: ${this.barsLabel()} ${f(v)} ${this.unit()}` + (this.line().length ? `, ${this.lineLabel()} ${f(this.line()[i])} ${this.unit()}` : ''),
      };
    });
  });

  protected readonly points = computed(() =>
    this.line().length ? this.cols().map((c, i) => `${c.cx},${this.y(this.line()[i] ?? 0)}`).join(' ') : '',
  );
}
