import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { LoginResponse } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  serverError: string = '';
  inconsistentWarning: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private toastService: ToastService,
    public themeService: ThemeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['General User', [Validators.required]],
    });

    // Auto-align role when typing known demo IDs
    this.loginForm.get('userId')?.valueChanges.subscribe((rawVal: string) => {
      const val = (rawVal || '').trim().toLowerCase();
      this.serverError = '';

      if (val === 'admin01') {
        if (this.loginForm.get('role')?.value !== 'Administrator') {
          this.loginForm.patchValue({ role: 'Administrator' }, { emitEvent: false });
        }
        this.inconsistentWarning = '';
      } else if (val === 'user01' || val === 'user02') {
        if (this.loginForm.get('role')?.value !== 'General User') {
          this.loginForm.patchValue({ role: 'General User' }, { emitEvent: false });
        }
        this.inconsistentWarning = '';
      } else {
        this.checkConsistency();
      }
      this.cdr.markForCheck();
    });

    this.loginForm.get('role')?.valueChanges.subscribe(() => {
      this.serverError = '';
      this.checkConsistency();
      this.cdr.markForCheck();
    });
  }

  private checkConsistency(): void {
    const uid = (this.loginForm.get('userId')?.value || '').trim().toLowerCase();
    const role = this.loginForm.get('role')?.value;

    if (uid === 'admin01' && role === 'General User') {
      this.inconsistentWarning = 'Note: admin01 is registered as an Administrator.';
    } else if ((uid === 'user01' || uid === 'user02') && role === 'Administrator') {
      this.inconsistentWarning = 'Note: user accounts require General User role.';
    } else {
      this.inconsistentWarning = '';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  fillDemo(userId: string, pass: string, role: 'General User' | 'Administrator'): void {
    this.serverError = '';
    this.inconsistentWarning = '';
    this.loginForm.patchValue({
      userId,
      password: pass,
      role,
    });
    this.cdr.markForCheck();
  }

  selectRole(role: 'General User' | 'Administrator'): void {
    this.loginForm.patchValue({ role });
    this.checkConsistency();
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    this.serverError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastService.warning('Please complete all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const credentials = this.loginForm.value;

    this.authService
      .login(credentials)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res: LoginResponse) => {
          this.userService.setCurrentUser(res.user);
          const displayName = res.user.name || res.user.fullName || res.user.userId;
          this.toastService.success(
            `Welcome back, ${displayName}!`,
            'Authentication Successful'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (err: { error?: { error?: string } }) => {
          const message = err.error?.error || 'Invalid credentials or role selection.';
          this.serverError = message;
          this.toastService.error(message, 'Login Failed');
          this.cdr.markForCheck();
        },
      });
  }

  get userIdControl() {
    return this.loginForm.get('userId');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  get roleControl() {
    return this.loginForm.get('role');
  }
}
