import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api.token';
import { RecordItem } from '../models/record.model';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {}

  /**
   * Fetch records for the currently authenticated user.
   * Role-based filtering is strictly performed on the backend:
   *  - General User: receives records where ownerUserId === user.userId
   *  - Administrator: receives records for all users
   *
   * @param delay Artificial latency in ms (e.g. 0, 1000, 3000, 5000)
   */
  getRecords(delay?: number): Observable<RecordItem[]> {
    let params = new HttpParams();
    if (delay !== undefined && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.get<RecordItem[]>(`${this.apiUrl}/records`, { params });
  }
}
