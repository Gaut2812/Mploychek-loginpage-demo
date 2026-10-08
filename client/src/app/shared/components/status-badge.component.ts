import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [ngClass]="status | statusBadge">
      <span class="dot"></span>
      {{ label || status }}
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input() status: string = 'active';
  @Input() label?: string;
}
