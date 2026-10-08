import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LayoutComponent } from './layout.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [LayoutComponent, TopbarComponent, SidebarComponent],
  imports: [CommonModule, RouterModule, SharedModule],
  exports: [LayoutComponent],
})
export class LayoutModule {}
