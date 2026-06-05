import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <h2>Admin</h2>
        <form (ngSubmit)="submit()">
          <input
            [(ngModel)]="user"
            name="user"
            type="text"
            placeholder="Usuario"
            autocomplete="username"
          />
          <input
            [(ngModel)]="pass"
            name="pass"
            type="password"
            placeholder="Contraseña"
            autocomplete="current-password"
          />
          @if (error()) {
            <p class="error">Credenciales incorrectas</p>
          }
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Verificando...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
    }
    .login-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 360px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    h2 { color: var(--text); font-size: 1.4rem; text-align: center; margin: 0; }
    form { display: flex; flex-direction: column; gap: 0.75rem; }
    input {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      outline: none;
    }
    input:focus { border-color: var(--accent); }
    button {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.75rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.25rem;
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: var(--red); font-size: 0.85rem; margin: 0; text-align: center; }
  `],
})
export class AdminLoginComponent {
  user = '';
  pass = '';
  readonly loading = signal(false);
  readonly error = signal(false);

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit() {
    if (!this.user || !this.pass) return;
    this.loading.set(true);
    this.error.set(false);
    this.auth.login(this.user, this.pass).subscribe(ok => {
      this.loading.set(false);
      if (ok) this.router.navigate(['/admin']);
      else this.error.set(true);
    });
  }
}
