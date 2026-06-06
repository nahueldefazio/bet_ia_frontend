import { Component, OnInit, OnDestroy, signal, computed, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, switchMap, startWith } from 'rxjs';
import { ApiService } from '../services/api';
import { Prediction } from '../models/types';

type SortKey = 'matchDate' | 'league' | 'market' | 'outcome' | 'bestOdd' | 'expectedValue' | 'trueProbability' | 'impliedProbability' | 'confidence';
type SortDir = 'asc' | 'desc';
const CONFIDENCE_ORDER: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

@Component({
  selector: 'app-value-bets',
  imports: [CommonModule, FormsModule],
  templateUrl: './value-bets.html',
  styleUrl: './value-bets.scss',
})
export class ValueBetsComponent implements OnInit, OnDestroy {
  private readonly allBets = signal<Prediction[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly lastUpdated = signal<Date | null>(null);
  private sub?: Subscription;

  readonly filterLeague = signal('');
  readonly filterMarket = signal('');
  readonly filterConfidence = signal('');
  readonly sortBy = signal<SortKey>('expectedValue');
  readonly sortDir = signal<SortDir>('desc');
  readonly selectedBet = signal<Prediction | null>(null);
  readonly aiLoading = signal(false);

  constructor(private readonly api: ApiService, private readonly zone: NgZone) {}

  ngOnInit() {
    this.sub = interval(60_000)
      .pipe(startWith(0), switchMap(() => this.api.getValueBets(50)))
      .subscribe({
        next: (data) => this.zone.run(() => {
          this.allBets.set(data);
          this.loading.set(false);
          this.lastUpdated.set(new Date());
        }),
        error: () => this.zone.run(() => {
          this.loading.set(false);
          this.error.set(true);
        }),
      });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  readonly bets = computed(() => {
    let data = this.allBets();
    const league = this.filterLeague();
    const market = this.filterMarket();
    const confidence = this.filterConfidence();
    const sort = this.sortBy();
    const dir = this.sortDir();

    if (league) data = data.filter(b => b.match?.league?.toLowerCase().includes(league.toLowerCase()));
    if (market) data = data.filter(b => b.market === market);
    if (confidence) data = data.filter(b => b.confidence === confidence);

    return [...data].sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case 'matchDate':
          cmp = new Date(a.match?.matchDate ?? 0).getTime() - new Date(b.match?.matchDate ?? 0).getTime();
          break;
        case 'league':
          cmp = (a.match?.league ?? '').localeCompare(b.match?.league ?? '');
          break;
        case 'market':
          cmp = a.market.localeCompare(b.market);
          break;
        case 'outcome':
          cmp = a.outcome.localeCompare(b.outcome);
          break;
        case 'confidence':
          cmp = (CONFIDENCE_ORDER[a.confidence] ?? 0) - (CONFIDENCE_ORDER[b.confidence] ?? 0);
          break;
        default:
          cmp = (a[sort as keyof Prediction] as number) - (b[sort as keyof Prediction] as number);
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  setSort(key: SortKey) {
    if (this.sortBy() === key) {
      this.sortDir.update(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      this.sortBy.set(key);
      this.sortDir.set(['league', 'market', 'outcome', 'matchDate'].includes(key) ? 'asc' : 'desc');
    }
  }

  sortIcon(key: SortKey): string {
    if (this.sortBy() !== key) return '';
    return this.sortDir() === 'asc' ? ' ↑' : ' ↓';
  }

  readonly leagues = computed(() =>
    [...new Set(this.allBets().map(b => b.match?.league ?? '').filter(Boolean))].sort((a, b) => a.localeCompare(b))
  );

  readonly markets = computed(() =>
    [...new Set(this.allBets().map(b => b.market))].sort((a, b) => a.localeCompare(b))
  );

  resolveOutcome(bet: Prediction): string {
    const h = bet.match?.homeTeam ?? 'Local';
    const a = bet.match?.awayTeam ?? 'Visitante';
    const map: Record<string, string> = {
      Home: h, Away: a, Draw: 'Empate',
      OVER_2_5: 'Más de 2.5 goles', UNDER_2_5: 'Menos de 2.5 goles',
      Yes: 'Ambos anotan: Sí', No: 'Ambos anotan: No',
    };
    return map[bet.outcome] ?? bet.outcome;
  }

  evPercent(v: number): string { return '+' + (v * 100).toFixed(2) + '%'; }
  probPercent(v: number): string { return (v * 100).toFixed(1) + '%'; }
  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  }
  openModal(bet: Prediction) {
    this.selectedBet.set(bet);
    if (!bet.aiAnalysis) this.fetchAiAnalysis(bet.id);
  }

  private fetchAiAnalysis(id: number) {
    this.aiLoading.set(true);
    this.api.analyzeOnDemand(id).subscribe({
      next: (updated) => this.onAiResult(updated),
      error: () => this.zone.run(() => this.aiLoading.set(false)),
    });
  }

  private onAiResult(updated: Prediction) {
    this.zone.run(() => {
      this.selectedBet.set(updated);
      this.aiLoading.set(false);
      this.allBets.update(bets => bets.map(b => b.id === updated.id ? updated : b));
    });
  }
  closeModal() { this.selectedBet.set(null); }

  clearFilters() {
    this.filterLeague.set('');
    this.filterMarket.set('');
    this.filterConfidence.set('');
  }
}
