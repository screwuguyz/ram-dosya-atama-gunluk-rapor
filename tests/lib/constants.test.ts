// ============================================
// Constants - Unit Tests
// ============================================

import { describe, it, expect } from 'vitest';
import {
    APP_VERSION,
    CHANGELOG,
    LS_KEYS,
    DEFAULT_SETTINGS,
    CASE_TYPE_LABELS,
    API_ENDPOINTS,
} from '@/lib/constants';

describe('APP_VERSION', () => {
    it('should be a valid semver string', () => {
        expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
});

describe('CHANGELOG', () => {
    it('should contain current version', () => {
        expect(CHANGELOG[APP_VERSION]).toBeDefined();
        expect(Array.isArray(CHANGELOG[APP_VERSION])).toBe(true);
    });

    it('should have non-empty entries', () => {
        for (const version of Object.keys(CHANGELOG)) {
            expect(CHANGELOG[version].length).toBeGreaterThan(0);
        }
    });
});

describe('LS_KEYS', () => {
    it('should have all required keys', () => {
        expect(LS_KEYS.TEACHERS).toBeDefined();
        expect(LS_KEYS.CASES).toBeDefined();
        expect(LS_KEYS.HISTORY).toBeDefined();
        expect(LS_KEYS.SETTINGS).toBeDefined();
    });

    it('should have unique values', () => {
        const values = Object.values(LS_KEYS);
        const uniqueValues = new Set(values);
        expect(uniqueValues.size).toBe(values.length);
    });
});

describe('DEFAULT_SETTINGS', () => {
    it('should have all required fields', () => {
        expect(DEFAULT_SETTINGS.dailyLimit).toBeDefined();
        expect(DEFAULT_SETTINGS.scoreTest).toBeDefined();
        expect(DEFAULT_SETTINGS.scoreNewBonus).toBeDefined();
        expect(DEFAULT_SETTINGS.scoreTypeY).toBeDefined();
        expect(DEFAULT_SETTINGS.scoreTypeD).toBeDefined();
        expect(DEFAULT_SETTINGS.scoreTypeI).toBeDefined();
        expect(DEFAULT_SETTINGS.backupBonusAmount).toBeDefined();
        expect(DEFAULT_SETTINGS.absencePenaltyAmount).toBeDefined();
    });

    it('should have positive values', () => {
        expect(DEFAULT_SETTINGS.dailyLimit).toBeGreaterThan(0);
        expect(DEFAULT_SETTINGS.scoreTest).toBeGreaterThan(0);
    });
});

describe('CASE_TYPE_LABELS', () => {
    it('should have labels for all case types', () => {
        expect(CASE_TYPE_LABELS.YONLENDIRME).toBe('Yönlendirme');
        expect(CASE_TYPE_LABELS.DESTEK).toBe('Destek');
        expect(CASE_TYPE_LABELS.IKISI).toBe('İkisi');
    });
});

describe('API_ENDPOINTS', () => {
    it('should have all required endpoints', () => {
        expect(API_ENDPOINTS.STATE).toBe('/api/state');
        expect(API_ENDPOINTS.NOTIFY).toBe('/api/notify');
        expect(API_ENDPOINTS.PDF_IMPORT).toBe('/api/pdf-import');
        expect(API_ENDPOINTS.LOGIN).toBe('/api/login');
        expect(API_ENDPOINTS.LOGOUT).toBe('/api/logout');
    });

    it('should all start with /api/', () => {
        for (const endpoint of Object.values(API_ENDPOINTS)) {
            expect(endpoint.startsWith('/api/')).toBe(true);
        }
    });
});
