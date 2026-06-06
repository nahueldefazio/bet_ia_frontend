import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'admin_token';
  private readonly base = `${environment.apiUrl}/api/admin`;

  constructor(private readonly http: HttpClient) {}

  login(user: string, pass: string): Observable<boolean> {
    const token = btoa(`${user}:${pass}`);
    return this.http
      .post(
        `${this.base}/login`,
        {},
        { headers: new HttpHeaders({ Authorization: `Basic ${token}` }) },
      )
      .pipe(
        tap(() => sessionStorage.setItem(this.storageKey, token)),
        map(() => true),
        catchError(() => of(false)),
      );
  }

  logout(): void {
    sessionStorage.removeItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.storageKey);
  }

  getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem(this.storageKey) ?? '';
    return new HttpHeaders({ Authorization: `Basic ${token}` });
  }

  triggerSync(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.base}/sync`,
      {},
      { headers: this.getHeaders() },
    );
  }

  triggerEloSync(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.base}/sync-elo`,
      {},
      { headers: this.getHeaders() },
    );
  }
}
