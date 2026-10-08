import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    // Ensure no stale theme classes remain on body from previous sessions
    document.body.classList.remove('theme-dark', 'theme-light');
  }
}
