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
      role: ['general_user', [Validators.required]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  fillDemo(userId: string, pass: string, role: 'general_user' | 'admin'): void {
    this.loginForm.patchValue({
      userId,
      password: pass,
      role,
    });
    this.cdr.markForCheck();
  }

  onSubmit(): void {
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
          this.toastService.success(
            `Welcome back, ${res.user.fullName}!`,
            'Authentication Successful'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (err: { error?: { error?: string } }) => {
          const message = err.error?.error || 'Invalid credentials or role selection.';
          this.toastService.error(message, 'Login Failed');
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
