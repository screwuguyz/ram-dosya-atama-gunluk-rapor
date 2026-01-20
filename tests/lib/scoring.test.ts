// ============================================
// Scoring Utilities - Unit Tests
// ============================================

import { describe, it, expect } from 'vitest';
import {
    calculateScore,
    humanType,
    caseDescription,
    getTeacherDailyLoad,
    findBestTeacher,
} from '@/lib/scoring';
import type { Teacher, CaseFile, Settings } from '@/types';

const mockSettings: Settings = {
    dailyLimit: 5,
    scoreTest: 10,
    scoreNewBonus: 1,
    scoreTypeY: 1,
    scoreTypeD: 2,
    scoreTypeI: 3,
    backupBonusAmount: 3,
    absencePenaltyAmount: 3,
};

describe('calculateScore', () => {
    it('should calculate score for YONLENDIRME type', () => {
        const result = calculateScore(
            { type: 'YONLENDIRME', isNew: false, diagCount: 0, isTest: false },
            mockSettings
        );
        expect(result).toBe(1); // scoreTypeY = 1
    });

    it('should calculate score for DESTEK type', () => {
        const result = calculateScore(
            { type: 'DESTEK', isNew: false, diagCount: 0, isTest: false },
            mockSettings
        );
        expect(result).toBe(2); // scoreTypeD = 2
    });

    it('should calculate score for IKISI type', () => {
        const result = calculateScore(
            { type: 'IKISI', isNew: false, diagCount: 0, isTest: false },
            mockSettings
        );
        expect(result).toBe(3); // scoreTypeI = 3
    });

    it('should add bonus for new cases', () => {
        const result = calculateScore(
            { type: 'YONLENDIRME', isNew: true, diagCount: 0, isTest: false },
            mockSettings
        );
        expect(result).toBe(2); // 1 + 1 (newBonus)
    });

    it('should add diagCount to score', () => {
        const result = calculateScore(
            { type: 'YONLENDIRME', isNew: false, diagCount: 3, isTest: false },
            mockSettings
        );
        expect(result).toBe(4); // 1 + 3 (diagCount)
    });

    it('should use test score for test cases', () => {
        const result = calculateScore(
            { type: 'YONLENDIRME', isNew: true, diagCount: 5, isTest: true },
            mockSettings
        );
        expect(result).toBe(10); // scoreTest overrides everything
    });
});

describe('humanType', () => {
    it('should return Yönlendirme for YONLENDIRME', () => {
        expect(humanType('YONLENDIRME')).toBe('Yönlendirme');
    });

    it('should return Destek for DESTEK', () => {
        expect(humanType('DESTEK')).toBe('Destek');
    });

    it('should return İkisi for IKISI', () => {
        expect(humanType('IKISI')).toBe('İkisi');
    });

    it('should return — for undefined', () => {
        expect(humanType(undefined)).toBe('—');
    });
});

describe('caseDescription', () => {
    it('should generate description for normal case', () => {
        const caseFile: CaseFile = {
            id: '1',
            student: 'Test Student',
            score: 5,
            createdAt: '2025-12-25T10:00:00Z',
            type: 'YONLENDIRME',
            isNew: true,
            diagCount: 2,
            isTest: false,
        };
        const result = caseDescription(caseFile);
        expect(result).toContain('Yönlendirme');
        expect(result).toContain('Evet');
        expect(result).toContain('2');
    });

    it('should show special message for absence penalty', () => {
        const caseFile: CaseFile = {
            id: '1',
            student: 'Test Student',
            score: 5,
            createdAt: '2025-12-25T10:00:00Z',
            type: 'YONLENDIRME',
            isNew: false,
            diagCount: 0,
            isTest: false,
            absencePenalty: true,
        };
        const result = caseDescription(caseFile);
        expect(result).toContain('Devamsızlık');
    });

    it('should include test indicator', () => {
        const caseFile: CaseFile = {
            id: '1',
            student: 'Test Student',
            score: 10,
            createdAt: '2025-12-25T10:00:00Z',
            type: 'DESTEK',
            isNew: false,
            diagCount: 0,
            isTest: true,
        };
        const result = caseDescription(caseFile);
        expect(result).toContain('Test');
    });
});

describe('getTeacherDailyLoad', () => {
    const teacher: Teacher = {
        id: 't1',
        name: 'Test Teacher',
        isAbsent: false,
        yearlyLoad: 50,
        active: true,
        isTester: false,
    };

    it('should return 0 when no cases assigned', () => {
        const cases: CaseFile[] = [];
        expect(getTeacherDailyLoad(teacher, cases)).toBe(0);
    });

    it('should count cases assigned to teacher', () => {
        const cases: CaseFile[] = [
            { id: '1', student: 'S1', score: 1, createdAt: '', type: 'YONLENDIRME', isNew: false, diagCount: 0, isTest: false, assignedTo: 't1' },
            { id: '2', student: 'S2', score: 1, createdAt: '', type: 'YONLENDIRME', isNew: false, diagCount: 0, isTest: false, assignedTo: 't1' },
            { id: '3', student: 'S3', score: 1, createdAt: '', type: 'YONLENDIRME', isNew: false, diagCount: 0, isTest: false, assignedTo: 't2' },
        ];
        expect(getTeacherDailyLoad(teacher, cases)).toBe(2);
    });
});

describe('findBestTeacher', () => {
    const teachers: Teacher[] = [
        { id: 't1', name: 'Teacher 1', isAbsent: false, yearlyLoad: 50, active: true, isTester: false },
        { id: 't2', name: 'Teacher 2', isAbsent: false, yearlyLoad: 30, active: true, isTester: false },
        { id: 't3', name: 'Teacher 3', isAbsent: true, yearlyLoad: 20, active: true, isTester: false },
        { id: 't4', name: 'Teacher 4', isAbsent: false, yearlyLoad: 40, active: false, isTester: false },
    ];

    it('should find teacher with lowest yearly load', () => {
        const result = findBestTeacher(teachers, [], mockSettings);
        expect(result?.id).toBe('t2'); // 30 is lowest among active, non-absent
    });

    it('should exclude absent teachers', () => {
        const result = findBestTeacher(teachers, [], mockSettings);
        expect(result?.id).not.toBe('t3');
    });

    it('should exclude inactive teachers', () => {
        const result = findBestTeacher(teachers, [], mockSettings);
        expect(result?.id).not.toBe('t4');
    });

    it('should return null when no teachers available', () => {
        const result = findBestTeacher([], [], mockSettings);
        expect(result).toBeNull();
    });

    it('should respect daily limit', () => {
        const cases: CaseFile[] = Array(5).fill(null).map((_, i) => ({
            id: `c${i}`,
            student: `S${i}`,
            score: 1,
            createdAt: '',
            type: 'YONLENDIRME' as const,
            isNew: false,
            diagCount: 0,
            isTest: false,
            assignedTo: 't2',
        }));
        const result = findBestTeacher(teachers, cases, mockSettings);
        // t2 hit daily limit (5), so should pick t1 (next lowest)
        expect(result?.id).toBe('t1');
    });
});
