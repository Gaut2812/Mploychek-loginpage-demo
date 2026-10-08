import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string | undefined): string {
    if (!status) return 'badge-info';
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'public':
        return 'badge-success';
      case 'pending':
      case 'internal':
        return 'badge-warning';
      case 'rejected':
      case 'suspended':
      case 'inactive':
        return 'badge-danger';
      case 'confidential':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  }
}
