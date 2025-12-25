// ============================================
// Error Handler Utilities - Unit Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    safeApiCall,
    safeExecute,
    safeStorage,
    formatError,
    createError,
} from '@/lib/errorHandler';

describe('safeApiCall', () => {
    it('should return success with data on successful call', async () => {
        const result = await safeApiCall(async () => 'test data');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe('test data');
        }
    });

    it('should return error on failed call', async () => {
        const result = await safeApiCall(async () => {
            throw new Error('Test error');
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBe('Test error');
        }
    });

    it('should use fallback on error', async () => {
        const result = await safeApiCall(
            async () => {
                throw new Error('Test error');
            },
            { fallback: 'fallback value' }
        );
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe('fallback value');
        }
    });

    it('should use custom error message', async () => {
        const result = await safeApiCall(
            async () => {
                throw new Error('Original error');
            },
            { errorMessage: 'Custom error message' }
        );
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBe('Custom error message');
        }
    });

    it('should suppress logging when logError is false', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        await safeApiCall(
            async () => {
                throw new Error('Test');
            },
            { logError: false }
        );
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});

describe('safeExecute', () => {
    it('should return result on success', () => {
        const result = safeExecute(() => 'success', 'fallback');
        expect(result).toBe('success');
    });

    it('should return fallback on error', () => {
        const result = safeExecute(() => {
            throw new Error('Test');
        }, 'fallback');
        expect(result).toBe('fallback');
    });
});

describe('safeStorage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('get', () => {
        it('should return parsed value', () => {
            localStorage.setItem('test', JSON.stringify({ foo: 'bar' }));
            const result = safeStorage.get('test', {});
            expect(result).toEqual({ foo: 'bar' });
        });

        it('should return fallback for missing key', () => {
            const result = safeStorage.get('missing', 'default');
            expect(result).toBe('default');
        });

        it('should return fallback for invalid JSON', () => {
            localStorage.setItem('invalid', 'not json');
            const result = safeStorage.get('invalid', 'default');
            expect(result).toBe('default');
        });
    });

    describe('set', () => {
        it('should store value as JSON', () => {
            safeStorage.set('test', { foo: 'bar' });
            expect(localStorage.getItem('test')).toBe('{"foo":"bar"}');
        });

        it('should return true on success', () => {
            const result = safeStorage.set('test', 'value');
            expect(result).toBe(true);
        });
    });

    describe('remove', () => {
        it('should remove item', () => {
            localStorage.setItem('test', 'value');
            safeStorage.remove('test');
            expect(localStorage.getItem('test')).toBeNull();
        });
    });

    describe('getString', () => {
        it('should return string value', () => {
            localStorage.setItem('test', 'hello');
            expect(safeStorage.getString('test')).toBe('hello');
        });

        it('should return fallback for missing key', () => {
            expect(safeStorage.getString('missing', 'default')).toBe('default');
        });
    });

    describe('setString', () => {
        it('should store string value', () => {
            safeStorage.setString('test', 'hello');
            expect(localStorage.getItem('test')).toBe('hello');
        });
    });
});

describe('formatError', () => {
    it('should extract message from Error', () => {
        expect(formatError(new Error('Test message'))).toBe('Test message');
    });

    it('should return string as-is', () => {
        expect(formatError('String error')).toBe('String error');
    });

    it('should return default message for unknown types', () => {
        expect(formatError({ foo: 'bar' })).toBe('Beklenmeyen bir hata oluştu');
        expect(formatError(null)).toBe('Beklenmeyen bir hata oluştu');
    });
});

describe('createError', () => {
    it('should create Error with message', () => {
        const error = createError('Test error');
        expect(error.message).toBe('Test error');
    });

    it('should attach context to error', () => {
        const error = createError('Test error', { userId: '123' }) as Error & { context?: Record<string, unknown> };
        expect(error.context).toEqual({ userId: '123' });
    });
});
