import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state-box">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      </div>
      <h4 class="empty-title">{{ title }}</h4>
      <p class="empty-desc">{{ description }}</p>
    </div>
  `,
  styles: [
    `
      .empty-state-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
      }
      .empty-icon {
        color: var(--text-dim);
        margin-bottom: 16px;
        opacity: 0.7;
      }
      .empty-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--text-main);
      }
      .empty-desc {
        font-size: 0.9rem;
        color: var(--text-muted);
        max-width: 380px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() title: string = 'No records found';
  @Input() description: string = 'There are no items matching this criteria currently.';
}
