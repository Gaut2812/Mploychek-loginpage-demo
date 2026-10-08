import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    if (this.authService.isAdmin()) {
      return true;
    }

    this.toastService.error(
      'Access Denied: Administrator privileges required to access User Management.',
      '403 Forbidden'
    );
    return this.router.createUrlTree(['/dashboard']);
  }
}
