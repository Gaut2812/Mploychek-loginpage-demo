import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleLabel',
})
export class RoleLabelPipe implements PipeTransform {
  transform(role: string | undefined): string {
    if (!role) return '';
    switch (role.toLowerCase()) {
      case 'general_user':
        return 'General User';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  }
}
