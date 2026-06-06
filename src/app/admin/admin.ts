import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-admin',
  imports: [RouterLink],
  template: `
    <div class="admin-wrap">
      <div class="admin-card">
        <div class="header">
          <h2>Panel Admin</h2>
          <button class="logout" (click)="logout()">Salir</button>
        </div>

        <section>
          <h3>Sincronización de datos</h3>
          <p class="desc">Fuerza el fetch de cuotas y el análisis de IA para todos los deportes configurados.</p>
          <button class="action" (click)="sync()" [disabled]="syncing()">
            {{ syncing() ? 'Sincronizando...' : '⚡ Sincronizar ahora' }}
          </button>
          @if (syncMsg()) {
            <p class="msg" [class.error]="syncError()">{{ syncMsg() }}</p>
          }
        </section>

        <section>
          <h3>Ratings Elo — Selecciones nacionales</h3>
          <p class="desc">Descarga y procesa ~150 años de resultados internacionales para calcular los ratings Elo de cada selección. Usado para mejorar las predicciones del Mundial. Tarda ~30s.</p>
          <button class="action" (click)="syncElo()" [disabled]="syncingElo()">
            {{ syncingElo() ? 'Procesando...' : '🌍 Sincronizar ratings Elo' }}
          </button>
          @if (eloMsg()) {
            <p class="msg" [class.error]="eloError()">{{ eloMsg() }}</p>
          }
        </section>

        <a routerLink="/dashboard" class="back">← Volver al dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .admin-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      padding: 2rem;
    }
    .admin-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    h2 { color: var(--text); font-size: 1.3rem; margin: 0; }
    h3 { color: var(--text); font-size: 1rem; margin: 0 0 0.5rem; }
    .desc { color: var(--muted); font-size: 0.875rem; margin: 0 0 1rem; line-height: 1.5; }
    .action {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
    }
    .action:disabled { opacity: 0.6; cursor: not-allowed; }
    .logout {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--muted);
      border-radius: 6px;
      padding: 0.4rem 0.9rem;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .logout:hover { color: var(--text); }
    .msg { font-size: 0.875rem; margin: 0.75rem 0 0; color: var(--green); }
    .msg.error { color: var(--red); }
    .back { color: var(--muted); font-size: 0.875rem; text-decoration: none; }
    .back:hover { color: var(--text); }
  `],
})
export class AdminComponent {
  readonly syncing = signal(false);
  readonly syncMsg = signal('');
  readonly syncError = signal(false);
  readonly syncingElo = signal(false);
  readonly eloMsg = signal('');
  readonly eloError = signal(false);

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  sync() {
    this.syncing.set(true);
    this.syncMsg.set('');
    this.auth.triggerSync().subscribe({
      next: (res) => {
        this.syncing.set(false);
        this.syncError.set(false);
        this.syncMsg.set(res.message + ' — los datos aparecerán en unos minutos.');
      },
      error: () => {
        this.syncing.set(false);
        this.syncError.set(true);
        this.syncMsg.set('Error al sincronizar. Verificá tu sesión.');
      },
    });
  }

  syncElo() {
    this.syncingElo.set(true);
    this.eloMsg.set('');
    this.auth.triggerEloSync().subscribe({
      next: (res) => {
        this.syncingElo.set(false);
        this.eloError.set(false);
        this.eloMsg.set(res.message);
      },
      error: () => {
        this.syncingElo.set(false);
        this.eloError.set(true);
        this.eloMsg.set('Error al sincronizar Elo. Verificá tu sesión.');
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
