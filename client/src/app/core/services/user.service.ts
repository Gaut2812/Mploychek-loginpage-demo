import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { API_URL } from '../tokens/api.token';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {}

  /**
   * Normalizes the base API URL to ensure it points to the API root without trailing slash.
   * If apiUrl already ends with '/api', it is preserved.
   * If apiUrl does not end with '/api', '/api' is appended.
   * Prevents duplicating '/api' when apiUrl already includes it.
   */
  private get apiBase(): string {
    const base = (this.apiUrl || '').trim().replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }

  /**
   * Base endpoint for user operations (/api/users).
   */
  private get usersEndpoint(): string {
    return `${this.apiBase}/users`;
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Called on app initialization and profile refreshes.
   * Calls GET /api/users/me and populates the currentUser$ stream.
   */
  loadCurrentUser(): Observable<User | null> {
    return this.http.get<User>(`${this.usersEndpoint}/me`).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  /**
   * Admin: List all users in system directory.
   */
  getAllUsers(delay?: number): Observable<User[]> {
    let params = new HttpParams();
    if (delay !== undefined && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.get<User[]>(this.usersEndpoint, { params });
  }

  /**
   * Admin: Create a new user account.
   */
  createUser(dto: CreateUserDto, delay?: number): Observable<User> {
    let params = new HttpParams();
    if (delay !== undefined && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.post<User>(this.usersEndpoint, dto, { params });
  }

  /**
   * Admin: Update existing user.
   */
  updateUser(userId: string, dto: UpdateUserDto, delay?: number): Observable<User> {
    let params = new HttpParams();
    if (delay !== undefined && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.put<User>(`${this.usersEndpoint}/${userId}`, dto, { params });
  }

  /**
   * Admin: Delete user from database.
   */
  deleteUser(userId: string, delay?: number): Observable<{ message: string }> {
    let params = new HttpParams();
    if (delay !== undefined && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.delete<{ message: string }>(`${this.usersEndpoint}/${userId}`, { params });
  }
}
