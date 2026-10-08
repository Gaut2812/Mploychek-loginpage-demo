import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const role = this.authService.getUserRole();
    if (role === 'admin') {
      return true;
    }

    this.toastService.error('Admin privileges required to access User Management.');
    return this.router.createUrlTree(['/dashboard']);
  }
}
