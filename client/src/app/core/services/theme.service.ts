import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'mploychek_theme';
  private readonly themeSubject = new BehaviorSubject<AppTheme>('dark');
  public readonly theme$: Observable<AppTheme> = this.themeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem(this.storageKey) as AppTheme | null;
    const initialTheme: AppTheme = saved === 'light' ? 'light' : 'dark';
    this.applyTheme(initialTheme);
  }

  public toggleTheme(): void {
    const nextTheme: AppTheme = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  public setTheme(theme: AppTheme): void {
    this.applyTheme(theme);
  }

  public get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  private applyTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.storageKey, theme);
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-light');
    body.classList.add(`theme-${theme}`);
  }
}
