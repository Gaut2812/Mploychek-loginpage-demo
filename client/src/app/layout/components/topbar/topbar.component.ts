import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  currentUser$: Observable<User | null>;

  constructor(
    private userService: UserService,
    public themeService: ThemeService,
    private authService: AuthService
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
