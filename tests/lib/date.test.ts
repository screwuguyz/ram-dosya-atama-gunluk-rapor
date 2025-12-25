// ============================================
// Date Utilities - Unit Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    daysInMonth,
    ymOf,
    ymdLocal,
    formatDateTR,
    formatDateShort,
    formatTime,
    daysBetween,
    getDayNameTR,
} from '@/lib/date';

describe('daysInMonth', () => {
    it('should return 31 for January', () => {
        expect(daysInMonth(2025, 1)).toBe(31);
    });

    it('should return 28 for February in non-leap year', () => {
        expect(daysInMonth(2025, 2)).toBe(28);
    });

    it('should return 29 for February in leap year', () => {
        expect(daysInMonth(2024, 2)).toBe(29);
    });

    it('should return 30 for April', () => {
        expect(daysInMonth(2025, 4)).toBe(30);
    });

    it('should return 31 for December', () => {
        expect(daysInMonth(2025, 12)).toBe(31);
    });
});

describe('ymOf', () => {
    it('should extract YYYY-MM from ISO date string', () => {
        expect(ymOf('2025-12-25T10:30:00.000Z')).toBe('2025-12');
    });

    it('should work with date-only string', () => {
        expect(ymOf('2025-06-15')).toBe('2025-06');
    });
});

describe('ymdLocal', () => {
    it('should format Date to YYYY-MM-DD', () => {
        const date = new Date(2025, 11, 25); // December 25, 2025
        expect(ymdLocal(date)).toBe('2025-12-25');
    });

    it('should pad single digit months and days', () => {
        const date = new Date(2025, 0, 5); // January 5, 2025
        expect(ymdLocal(date)).toBe('2025-01-05');
    });
});

describe('formatDateTR', () => {
    it('should format date in Turkish locale', () => {
        const result = formatDateTR('2025-12-25T10:30:00.000Z');
        expect(result).toContain('2025');
        expect(result).toContain('Aralık');
    });
});

describe('formatDateShort', () => {
    it('should format date as DD.MM.YYYY', () => {
        const result = formatDateShort('2025-12-25T10:30:00.000Z');
        expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });
});

describe('formatTime', () => {
    it('should format time as HH:MM', () => {
        const result = formatTime('2025-12-25T14:30:00.000Z');
        expect(result).toMatch(/\d{2}:\d{2}/);
    });
});

describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
        expect(daysBetween('2025-12-25', '2025-12-20')).toBe(5);
    });

    it('should return 0 for same date', () => {
        expect(daysBetween('2025-12-25', '2025-12-25')).toBe(0);
    });

    it('should work regardless of order', () => {
        expect(daysBetween('2025-12-20', '2025-12-25')).toBe(5);
    });
});

describe('getDayNameTR', () => {
    it('should return Turkish day name', () => {
        // December 25, 2025 is Thursday
        const result = getDayNameTR('2025-12-25');
        expect(result).toBe('Perşembe');
    });

    it('should return Pazartesi for Monday', () => {
        // December 22, 2025 is Monday
        const result = getDayNameTR('2025-12-22');
        expect(result).toBe('Pazartesi');
    });
});
