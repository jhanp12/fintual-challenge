import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Fund } from '../models/fund';
import { RealAsset } from '../models/real-asset';

@Injectable({
  providedIn: 'root'
})
export class FintualService {
  private apiUrl = 'https://fintual.cl/api';

  private funds: Fund[] = [
    { id: 186, name: 'Risky Norris', type: 'Agresivo' },
    { id: 187, name: 'Moderate Pitt', type: 'Moderado' },
    { id: 188, name: 'Conservative Clooney', type: 'Conservador' },
    { id: 15077, name: 'Very Conservative Streep', type: 'Muy Conservador' }
  ];

  constructor(private http: HttpClient) { }

  getFunds(): Observable<{ data: Fund[] }> {
    return of({ data: this.funds });
  }

  getFundData(fundId: number, fromDate?: string, toDate?: string): Observable<{ data: RealAsset[] }> {
    let url = `${this.apiUrl}/real_assets/${fundId}/days`;
    
    const params: string[] = [];
    if (fromDate) params.push(`from_date=${fromDate}`);
    if (toDate) params.push(`to_date=${toDate}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<{ data: RealAsset[] }>(url);
  }
}