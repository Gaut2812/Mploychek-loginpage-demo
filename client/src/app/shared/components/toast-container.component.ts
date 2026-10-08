import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-wrapper" aria-live="polite">
      <div
        *ngFor="let toast of toasts$ | async; trackBy: trackByToastId"
        class="toast-item glass-panel"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-indicator"></div>
        <div class="toast-content">
          <div class="toast-header" *ngIf="toast.title">
            <span class="toast-title">{{ toast.title }}</span>
          </div>
          <div class="toast-body">{{ toast.message }}</div>
        </div>
        <button
          type="button"
          class="toast-close"
          (click)="onClose(toast.id)"
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-wrapper {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        width: calc(100vw - 48px);
        pointer-events: none;
      }
      .toast-item {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        position: relative;
        overflow: hidden;
        padding: 12px 14px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .toast-indicator {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }
      .toast-success .toast-indicator {
        background: var(--color-success);
      }
      .toast-error .toast-indicator {
        background: var(--color-danger);
      }
      .toast-warning .toast-indicator {
        background: var(--color-warning);
      }
      .toast-info .toast-indicator {
        background: var(--color-info);
      }
      .toast-content {
        flex: 1;
        margin-left: 8px;
        margin-right: 12px;
      }
      .toast-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-main);
      }
      .toast-body {
        font-size: 0.825rem;
        color: var(--text-muted);
        margin-top: 2px;
        line-height: 1.4;
      }
      .toast-close {
        background: none;
        border: none;
        color: var(--text-dim);
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0 4px;
        line-height: 1;
        transition: color var(--transition-fast);
        &:hover {
          color: var(--text-main);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  toasts$: Observable<ToastMessage[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  onClose(id: string): void {
    this.toastService.remove(id);
  }

  trackByToastId(_index: number, item: ToastMessage): string {
    return item.id;
  }
}
