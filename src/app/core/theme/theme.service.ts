import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'tic-diaspora.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly modeState = signal<ThemeMode>(this.readTheme());

  readonly mode = computed(() => this.modeState());
  readonly isDark = computed(() => this.modeState() === 'dark');

  constructor() {
    effect(() => {
      const mode = this.modeState();
      this.document.documentElement.classList.toggle('dark', mode === 'dark');
      localStorage.setItem(STORAGE_KEY, mode);
    });
  }

  toggle(): void {
    this.modeState.update((mode) => mode === 'dark' ? 'light' : 'dark');
  }

  private readTheme(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
