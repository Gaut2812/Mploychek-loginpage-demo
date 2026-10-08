import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  template: `
    <div
      class="skeleton"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="borderRadius"
      [style.margin]="margin"
    ></div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() borderRadius: string = 'var(--radius-sm)';
  @Input() margin: string = '0';
}
