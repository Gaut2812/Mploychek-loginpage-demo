import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = 'An unexpected error occurred.';

        if (error.error && typeof error.error === 'object' && error.error.error) {
          errorMsg = error.error.error;
        } else if (typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.message) {
          errorMsg = error.message;
        }

        if (error.status === 401) {
          // If not currently on login page, toast and logout
          if (!req.url.includes('/auth/login')) {
            this.toastService.error('Session expired. Please log in again.');
            this.authService.logout();
          }
        } else if (error.status === 403) {
          this.toastService.error(errorMsg, 'Access Denied');
        } else if (error.status >= 500) {
          this.toastService.error(errorMsg, 'Server Error');
        }

        return throwError(() => error);
      })
    );
  }
}
