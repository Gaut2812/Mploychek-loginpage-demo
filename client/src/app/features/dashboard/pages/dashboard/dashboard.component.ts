import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, tap, finalize, catchError } from 'rxjs/operators';
import { UserService } from '../../../../core/services/user.service';
import { RecordService } from '../../../../core/services/record.service';
import { ToastService } from '../../../../core/services/toast.service';
import { User } from '../../../../core/models/user.model';
import { RecordItem } from '../../../../core/models/record.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;
  records$!: Observable<RecordItem[]>;

  // Controls & Filters
  searchControl = new FormControl('');
  accessFilterControl = new FormControl('ALL');
  selectedDelay: number = 0; // 0, 1000, 3000, 5000

  // Async Processing Status Showcase
  isLoading: boolean = false;
  loadingMessage: string = 'Loading records...';
  requestStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  requestDuration: number | null = null;
  private requestStartTimestamp: number = 0;

  // Refresh trigger subject
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  constructor(
    private userService: UserService,
    private recordService: RecordService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  ngOnInit(): void {
    // Ensure current user profile is fresh from GET /api/users/me
    if (!this.userService.currentUser) {
      this.userService.loadCurrentUser().subscribe();
    }

    const search$ = this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged()
    );

    const access$ = this.accessFilterControl.valueChanges;

    // Load records whenever refresh triggers or delay changes
    const fetchedRecords$ = this.refreshSubject.pipe(
      tap(() => {
        this.isLoading = true;
        this.requestStatus = 'loading';
        this.loadingMessage =
          this.selectedDelay > 0
            ? `Fetching data from API with ${this.selectedDelay}ms delay...`
            : 'Loading records from API...';
        this.requestStartTimestamp = performance.now();
        this.cdr.markForCheck();
      }),
      switchMap(() =>
        this.recordService.getRecords(this.selectedDelay).pipe(
          tap(() => {
            const duration = Math.round(performance.now() - this.requestStartTimestamp);
            this.requestDuration = duration;
            this.requestStatus = 'success';
          }),
          catchError((err) => {
            this.requestStatus = 'error';
            this.toastService.error('Failed to load records from server.');
            return of([]);
          }),
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          })
        )
      )
    );

    // Combine fetched records with client search & access filters
    this.records$ = combineLatest([fetchedRecords$, search$, access$]).pipe(
      map(([records, search, accessLevel]) => {
        const query = (search || '').toLowerCase().trim();
        const level = accessLevel || 'ALL';

        return records.filter((rec) => {
          const owner = (rec.ownerUserId || rec.userId || '').toLowerCase();
          const matchesQuery =
            !query ||
            rec.title.toLowerCase().includes(query) ||
            rec.description.toLowerCase().includes(query) ||
            rec.recordId.toLowerCase().includes(query) ||
            owner.includes(query);

          const matchesLevel =
            level === 'ALL' ||
            rec.accessLevel.toUpperCase() === level.toUpperCase() ||
            (level === 'READ' && rec.accessLevel.toUpperCase().includes('READ'));

          return matchesQuery && matchesLevel;
        });
      })
    );
  }

  setDelay(ms: number): void {
    if (this.isLoading) return; // Prevent changing delay while request is in-flight
    this.selectedDelay = ms;
    this.reloadRecords();
  }

  reloadRecords(): void {
    if (this.isLoading) return; // Prevent duplicate requests
    this.refreshSubject.next();
  }

  trackByRecordId(_index: number, item: RecordItem): string {
    return item.recordId;
  }
}
