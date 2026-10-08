import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private toastService: ToastService,

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

    this.loginForm.get('userId')?.valueChanges.subscribe((rawVal: string) => {
      const val = (rawVal || '').trim().toLowerCase();
      this.serverError = '';
      if (val === 'admin01') {
        this.loginForm.patchValue({ role: 'Admin' }, { emitEvent: false });
      } else if (val === 'user01' || val === 'user02') {
        this.loginForm.patchValue({ role: 'General User' }, { emitEvent: false });
      }
      this.cdr.markForCheck();
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.serverError = '';
      this.cdr.markForCheck();
    });
  }

  selectRole(role: 'General User' | 'Admin'): void {
    this.loginForm.patchValue({ role });
    this.serverError = '';
    this.cdr.markForCheck();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err: { error?: { error?: string } }) => {
          const message = err.error?.error || 'Invalid user ID or password.';
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
}
