import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './pages/admin/admin.component';

@NgModule({
  declarations: [AdminComponent],
  imports: [CommonModule, SharedModule, AdminRoutingModule],
})
export class AdminModule {}
