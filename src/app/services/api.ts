import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert, DashboardStats, Prediction } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = '/api';

  constructor(private readonly http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats`);
  }

  getValueBets(limit = 20): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.base}/value-bets?limit=${limit}`);
  }

  getAlerts(limit = 30): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.base}/alerts?limit=${limit}`);
  }

  analyzeOnDemand(predictionId: number): Observable<Prediction> {
    return this.http.post<Prediction>(`${this.base}/analyze/${predictionId}`, {});
  }
}
