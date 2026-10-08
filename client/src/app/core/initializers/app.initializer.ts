import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export function initializeApp(
  authService: AuthService,
  userService: UserService
): () => Observable<unknown> {
  return () => {
    if (authService.isAuthenticated()) {
      return userService.loadCurrentUser();
    }
    return of(null);
  };
}
