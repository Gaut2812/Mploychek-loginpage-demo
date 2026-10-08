import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, tap, finalize } from 'rxjs/operators';
import { UserService } from '../../../../core/services/user.service';
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
  requestStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  requestDuration: number | null = null;
  private requestStartTimestamp: number = 0;

  // Refresh trigger subject
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  ngOnInit(): void {
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
        this.requestStartTimestamp = performance.now();
        this.cdr.markForCheck();
      }),
      switchMap(() =>
        this.userService.getRecords(this.selectedDelay).pipe(
          tap(() => {
            const duration = Math.round(performance.now() - this.requestStartTimestamp);
            this.requestDuration = duration;
            this.requestStatus = 'success';
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
          const matchesQuery =
            !query ||
            rec.title.toLowerCase().includes(query) ||
            rec.description.toLowerCase().includes(query) ||
            rec.recordId.toLowerCase().includes(query) ||
            rec.userId.toLowerCase().includes(query);

          const matchesLevel =
            level === 'ALL' || rec.accessLevel.toUpperCase() === level.toUpperCase();

          return matchesQuery && matchesLevel;
        });
      })
    );
  }

  setDelay(ms: number): void {
    this.selectedDelay = ms;
    this.reloadRecords();
  }

  reloadRecords(): void {
    this.refreshSubject.next();
  }

  trackByRecordId(_index: number, item: RecordItem): string {
    return item.recordId;
  }
}
