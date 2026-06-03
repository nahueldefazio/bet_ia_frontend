import { Component, OnInit, OnDestroy, signal, computed, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval, Subscription, switchMap, startWith } from 'rxjs';
import { ApiService } from '../services/api';
import { DashboardStats, Prediction } from '../models/types';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly lastUpdated = signal<Date | null>(null);
  readonly topBets = computed<Prediction[]>(() => this.stats()?.topBets ?? []);

  private sub?: Subscription;

  constructor(private readonly api: ApiService, private readonly zone: NgZone) {}

  ngOnInit() {
    this.sub = interval(60_000)
      .pipe(startWith(0), switchMap(() => this.api.getStats()))
      .subscribe({
        next: (data) => this.zone.run(() => {
          this.stats.set(data);
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

  evPercent(val: number): string { return '+' + (val * 100).toFixed(2) + '%'; }
  probPercent(val: number): string { return (val * 100).toFixed(1) + '%'; }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
