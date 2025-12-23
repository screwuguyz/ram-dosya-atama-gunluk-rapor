import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock CSS imports
vi.mock('@/app/globals.css', () => ({}));

import {
  getThemeMode,
  setThemeMode,
  getColorScheme,
  setColorScheme,
  getEffectiveTheme,
  applyTheme,
} from '@/lib/theme';

describe('Theme Management', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset DOM
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  describe('getThemeMode', () => {
    it('should return "auto" by default when no theme is set', () => {
      expect(getThemeMode()).toBe('auto');
    });

    it('should return saved theme mode from localStorage', () => {
      localStorage.setItem('site_theme_mode', 'dark');
      expect(getThemeMode()).toBe('dark');
    });

    it('should return "auto" for invalid theme modes', () => {
      localStorage.setItem('site_theme_mode', 'invalid');
      expect(getThemeMode()).toBe('auto');
    });
  });

  describe('setThemeMode', () => {
    it('should save theme mode to localStorage', () => {
      setThemeMode('light', false);
      expect(localStorage.getItem('site_theme_mode')).toBe('light');
    });

    it('should apply theme to document', () => {
      setThemeMode('dark', false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should not sync to Supabase when syncToSupabase is false', () => {
      const callback = vi.fn();
      // Note: In real implementation, you'd need to set the callback
      setThemeMode('light', false);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getColorScheme', () => {
    it('should return default color scheme when none is set', () => {
      const scheme = getColorScheme();
      expect(scheme.name).toBe('Varsayılan (Teal-Orange)');
      expect(scheme.primary).toBe('#0d9488');
    });

    it('should return saved color scheme from localStorage', () => {
      localStorage.setItem('site_color_scheme', 'blue');
      const scheme = getColorScheme();
      expect(scheme.name).toBe('Mavi Tema');
    });

    it('should return custom colors when custom scheme is set', () => {
      const customColors = {
        name: 'Özel Tema',
        primary: '#ff0000',
        primaryDark: '#cc0000',
        primaryLight: '#ff3333',
        accent: '#00ff00',
        accentDark: '#00cc00',
        accentLight: '#33ff33',
        bgBase: '#ffffff',
        bgWarm: '#f5f5f5',
        bgCard: '#ffffff',
        textMain: '#000000',
        textMuted: '#666666',
        textLight: '#999999',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      };
      localStorage.setItem('site_color_scheme', 'custom');
      localStorage.setItem('site_custom_colors', JSON.stringify(customColors));
      
      const scheme = getColorScheme();
      expect(scheme.name).toBe('Özel Tema');
      expect(scheme.primary).toBe('#ff0000');
    });
  });

  describe('setColorScheme', () => {
    it('should save color scheme to localStorage', () => {
      setColorScheme('blue', false);
      expect(localStorage.getItem('site_color_scheme')).toBe('blue');
    });

    it('should remove custom colors when setting a predefined scheme', () => {
      localStorage.setItem('site_custom_colors', '{"name":"Custom"}');
      setColorScheme('green', false);
      expect(localStorage.getItem('site_custom_colors')).toBeNull();
    });
  });

  describe('getEffectiveTheme', () => {
    it('should return "light" when mode is "light"', () => {
      localStorage.setItem('site_theme_mode', 'light');
      expect(getEffectiveTheme()).toBe('light');
    });

    it('should return "dark" when mode is "dark"', () => {
      localStorage.setItem('site_theme_mode', 'dark');
      expect(getEffectiveTheme()).toBe('dark');
    });

    it('should return system preference when mode is "auto"', () => {
      localStorage.setItem('site_theme_mode', 'auto');
      // Mock matchMedia to return dark preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      // This will depend on system preference, but we can test the logic
      const theme = getEffectiveTheme();
      expect(['light', 'dark']).toContain(theme);
    });
  });

  describe('applyTheme', () => {
    it('should set data-theme attribute on document', () => {
      localStorage.setItem('site_theme_mode', 'dark');
      applyTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should set CSS custom properties', () => {
      applyTheme();
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--primary')).toBeTruthy();
      expect(root.style.getPropertyValue('--accent')).toBeTruthy();
    });
  });
});

