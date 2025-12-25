// ============================================
// Export Utilities - Unit Tests
// ============================================

import { describe, it, expect } from 'vitest';
import { csvEscape, generateFilename } from '@/lib/export';

describe('csvEscape', () => {
    it('should return plain text unchanged', () => {
        expect(csvEscape('Hello World')).toBe('Hello World');
    });

    it('should return numbers as strings', () => {
        expect(csvEscape(123)).toBe('123');
    });

    it('should wrap text with commas in quotes', () => {
        expect(csvEscape('Hello, World')).toBe('"Hello, World"');
    });

    it('should wrap text with newlines in quotes', () => {
        expect(csvEscape('Hello\nWorld')).toBe('"Hello\nWorld"');
    });

    it('should escape double quotes', () => {
        expect(csvEscape('Say "Hello"')).toBe('"Say ""Hello"""');
    });

    it('should handle empty string', () => {
        expect(csvEscape('')).toBe('');
    });

    it('should handle null/undefined', () => {
        expect(csvEscape(null as unknown as string)).toBe('');
        expect(csvEscape(undefined as unknown as string)).toBe('');
    });
});

describe('generateFilename', () => {
    it('should generate filename with current date', () => {
        const result = generateFilename('report', 'csv');
        expect(result).toMatch(/^report_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should use provided date', () => {
        // Use ISO string to avoid timezone issues
        const date = new Date('2025-12-25T12:00:00Z');
        const result = generateFilename('backup', 'json', date);
        // Check pattern instead of exact date (timezone may shift the day)
        expect(result).toMatch(/^backup_2025-12-2[45]\.json$/);
    });

    it('should work with different extensions', () => {
        const result1 = generateFilename('data', 'xlsx');
        const result2 = generateFilename('export', 'pdf');
        expect(result1).toMatch(/^data_\d{4}-\d{2}-\d{2}\.xlsx$/);
        expect(result2).toMatch(/^export_\d{4}-\d{2}-\d{2}\.pdf$/);
    });
});
