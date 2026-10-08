import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective implements OnInit {
  private allowedRole: string = '';
  private isVisible: boolean = false;

  @Input()
  set hasRole(role: string) {
    this.allowedRole = role;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const userRole = this.authService.getUserRole();
    const canAccess = userRole === this.allowedRole;

    if (canAccess && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!canAccess && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
