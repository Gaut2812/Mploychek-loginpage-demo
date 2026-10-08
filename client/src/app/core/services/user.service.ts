import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { API_URL } from '../tokens/api.token';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { RecordItem } from '../models/record.model';

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

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Called during APP_INITIALIZER and after login.
   * If token exists, fetches /api/users/me and populates currentUser$.
   */
  loadCurrentUser(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  /**
   * Fetch records for currently logged-in user (General User -> own, Admin -> all).
   * Optional delay parameter allows testing async processing.
   */
  getRecords(delay?: number): Observable<RecordItem[]> {
    let params = new HttpParams();
    if (delay && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.get<RecordItem[]>(`${this.apiUrl}/records`, { params });
  }

  /**
   * Admin: List all users in system.
   * Accepts delay parameter to showcase skeleton & progress loaders.
   */
  getAllUsers(delay?: number): Observable<User[]> {
    let params = new HttpParams();
    if (delay && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.get<User[]>(`${this.apiUrl}/users`, { params });
  }

  /**
   * Admin: Create new user.
   */
  createUser(dto: CreateUserDto, delay?: number): Observable<User> {
    let params = new HttpParams();
    if (delay && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.post<User>(`${this.apiUrl}/users`, dto, { params });
  }

  /**
   * Admin: Update user profile or status.
   */
  updateUser(userId: string, dto: UpdateUserDto, delay?: number): Observable<User> {
    let params = new HttpParams();
    if (delay && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, dto, { params });
  }

  /**
   * Admin: Delete user from database.
   */
  deleteUser(userId: string, delay?: number): Observable<{ message: string }> {
    let params = new HttpParams();
    if (delay && delay > 0) {
      params = params.set('delay', delay.toString());
    }
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${userId}`, { params });
  }
}
