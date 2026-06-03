import { Component, OnInit, OnDestroy, signal, computed, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api';
import { Alert } from '../models/types';

@Component({
  selector: 'app-alerts',
  imports: [CommonModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class AlertsComponent implements OnInit, OnDestroy {
  readonly alerts = signal<Alert[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  private sub?: Subscription;

  readonly wonCount = computed(() => this.alerts().filter(a => this.getResult(a).won === true).length);
  readonly lostCount = computed(() => this.alerts().filter(a => this.getResult(a).won === false).length);
  readonly pendingCount = computed(() => this.alerts().filter(a => this.getResult(a).won === null).length);

  constructor(private readonly api: ApiService, private readonly zone: NgZone) {}

  ngOnInit() {
    this.sub = this.api.getAlerts(30).subscribe({
      next: (data) => this.zone.run(() => { this.alerts.set(data); this.loading.set(false); }),
      error: () => this.zone.run(() => { this.loading.set(false); this.error.set(true); }),
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  getResult(alert: Alert): { text: string; won: boolean | null } {
    const { homeGoals, awayGoals } = alert.match;
    if (homeGoals === null || awayGoals === null) return { text: 'Pendiente', won: null };

    const score = `${homeGoals} - ${awayGoals}`;
    const { outcome, market } = alert.prediction;
    let won: boolean;

    if (market === '1X2') {
      if (outcome === 'Home') won = homeGoals > awayGoals;
      else if (outcome === 'Away') won = awayGoals > homeGoals;
      else won = homeGoals === awayGoals;
    } else if (market === 'BTTS') {
      won = outcome === 'Yes' ? (homeGoals > 0 && awayGoals > 0) : !(homeGoals > 0 && awayGoals > 0);
    } else if (market === 'OVER_UNDER') {
      const total = homeGoals + awayGoals;
      won = outcome === 'OVER_2_5' ? total > 2 : total <= 2;
    } else {
      won = false;
    }

    return { text: score, won };
  }

  evPercent(v: number): string { return '+' + (v * 100).toFixed(2) + '%'; }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
