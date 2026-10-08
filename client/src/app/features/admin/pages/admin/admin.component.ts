import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, tap, finalize, catchError } from 'rxjs/operators';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';
import { User, CreateUserDto, UpdateUserDto } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  users$!: Observable<User[]>;

  // Controls & Filters
  searchControl = new FormControl('');
  roleFilterControl = new FormControl('ALL');
  selectedDelay: number = 3000; // Default to 3000ms to showcase async processing!

  // Async Processing Status
  isLoading: boolean = false;
  isMutating: boolean = false;
  loadingMessage: string = 'Loading directory...';
  requestStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  requestDuration: number | null = null;
  private requestStartTimestamp: number = 0;

  // Refresh trigger subject
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  // Modal State
  showModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedUser: User | null = null;
  userForm!: FormGroup;

  // Delete Confirm Modal
  showDeleteModal: boolean = false;
  userToDelete: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    const search$ = this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged()
    );

    const role$ = this.roleFilterControl.valueChanges;

    const fetchedUsers$ = this.refreshSubject.pipe(
      tap(() => {
        this.isLoading = true;
        this.requestStatus = 'loading';
        this.loadingMessage =
          this.selectedDelay > 0
            ? `Fetching directory from API with ${this.selectedDelay}ms delay...`
            : 'Loading directory from API...';
        this.requestStartTimestamp = performance.now();
        this.cdr.markForCheck();
      }),
      switchMap(() =>
        this.userService.getAllUsers(this.selectedDelay).pipe(
          tap(() => {
            const duration = Math.round(performance.now() - this.requestStartTimestamp);
            this.requestDuration = duration;
            this.requestStatus = 'success';
          }),
          catchError(() => {
            this.requestStatus = 'error';
            this.toastService.error('Failed to load user directory.');
            return of([]);
          }),
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          })
        )
      )
    );

    this.users$ = combineLatest([fetchedUsers$, search$, role$]).pipe(
      map(([users, search, roleFilter]) => {
        const query = (search || '').toLowerCase().trim();
        const role = (roleFilter || 'ALL').toLowerCase();

        return users.filter((u) => {
          const dName = (u.name || u.fullName || '').toLowerCase();
          const matchesQuery =
            !query ||
            dName.includes(query) ||
            u.userId.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.department.toLowerCase().includes(query);

          const uRole = u.role.toLowerCase();
          const matchesRole =
            role === 'all' ||
            (role.includes('admin') && uRole.includes('admin')) ||
            (role.includes('general') && uRole.includes('general'));

          return matchesQuery && matchesRole;
        });
      })
    );
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      department: ['', [Validators.required]],
      role: ['General User', [Validators.required]],
      status: ['Active', [Validators.required]],
    });
  }

  setDelay(ms: number): void {
    if (this.isLoading) return;
    this.selectedDelay = ms;
    this.reloadUsers();
  }

  reloadUsers(): void {
    if (this.isLoading) return;
    this.refreshSubject.next();
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.userForm.reset({
      userId: '',
      password: '',
      fullName: '',
      email: '',
      department: '',
      role: 'General User',
      status: 'Active',
    });
    this.userForm.get('userId')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(user: User): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.userForm.reset({
      userId: user.userId,
      password: '',
      fullName: user.name || user.fullName,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
    });
    this.userForm.get('userId')?.disable(); // User ID cannot be changed in edit
    this.userForm.get('password')?.clearValidators(); // Password is optional on update
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  onSaveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastService.warning('Please fill in all required fields properly.');
      return;
    }

    this.isMutating = true;
    const formVal = this.userForm.getRawValue();
    const startMs = performance.now();

    if (this.modalMode === 'create') {
      const dto: CreateUserDto = {
        userId: formVal.userId,
        password: formVal.password,
        name: formVal.fullName,
        fullName: formVal.fullName,
        email: formVal.email,
        department: formVal.department,
        role: formVal.role,
      };

      this.userService
        .createUser(dto, this.selectedDelay)
        .pipe(
          finalize(() => {
            this.isMutating = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (created) => {
            const elapsed = Math.round(performance.now() - startMs);
            const dName = created.name || created.fullName;
            this.toastService.success(
              `User "${dName}" created in ${elapsed}ms`,
              'User Created'
            );
            this.closeModal();
            this.reloadUsers();
          },
          error: (err) => {
            this.toastService.error(err.error?.error || 'Failed to create user.');
          },
        });
    } else {
      // Edit mode
      const dto: UpdateUserDto = {
        name: formVal.fullName,
        fullName: formVal.fullName,
        email: formVal.email,
        department: formVal.department,
        role: formVal.role,
        status: formVal.status,
      };
      if (formVal.password) {
        dto.password = formVal.password;
      }

      this.userService
        .updateUser(this.selectedUser!.userId, dto, this.selectedDelay)
        .pipe(
          finalize(() => {
            this.isMutating = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (updated) => {
            const elapsed = Math.round(performance.now() - startMs);
            const dName = updated.name || updated.fullName;
            this.toastService.success(
              `User "${dName}" updated in ${elapsed}ms`,
              'User Updated'
            );
            this.closeModal();
            this.reloadUsers();
          },
          error: (err) => {
            this.toastService.error(err.error?.error || 'Failed to update user.');
          },
        });
    }
  }

  openDeleteConfirm(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.isMutating = true;
    const userId = this.userToDelete.userId;
    const startMs = performance.now();

    this.userService
      .deleteUser(userId, this.selectedDelay)
      .pipe(
        finalize(() => {
          this.isMutating = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          const elapsed = Math.round(performance.now() - startMs);
          this.toastService.success(
            `User "${userId}" removed in ${elapsed}ms`,
            'User Deleted'
          );
          this.closeDeleteModal();
          this.reloadUsers();
        },
        error: (err) => {
          this.toastService.error(err.error?.error || 'Failed to delete user.');
        },
      });
  }

  trackByUserId(_index: number, item: User): string {
    return item.userId;
  }
}
