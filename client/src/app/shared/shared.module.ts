import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SkeletonLoaderComponent } from './components/skeleton-loader.component';
import { ProgressBarComponent } from './components/progress-bar.component';
import { StatusBadgeComponent } from './components/status-badge.component';
import { EmptyStateComponent } from './components/empty-state.component';
import { ToastContainerComponent } from './components/toast-container.component';

import { HasRoleDirective } from './directives/has-role.directive';
import { StatusBadgePipe } from './pipes/status-badge.pipe';
import { RoleLabelPipe } from './pipes/role-label.pipe';

@NgModule({
  declarations: [
    SkeletonLoaderComponent,
    ProgressBarComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ToastContainerComponent,
    HasRoleDirective,
    StatusBadgePipe,
    RoleLabelPipe,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SkeletonLoaderComponent,
    ProgressBarComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ToastContainerComponent,
    HasRoleDirective,
    StatusBadgePipe,
    RoleLabelPipe,
  ],
})
export class SharedModule {}
