// ============================================
// RAM Dosya Atama - Export Utilities
// ============================================

import type { Teacher, CaseFile } from "@/types";
import { humanType } from "@/lib/scoring";
import { formatDateShort } from "@/lib/date";

/**
 * Escape value for CSV format
 */
export function csvEscape(v: string | number): string {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return '"' + s.replaceAll('"', '""') + '"';
    }
    return s;
}

/**
 * Export cases to CSV format
 */
export function exportCasesToCsv(
    cases: CaseFile[],
    teachers: Teacher[],
    options?: {
        includeHeader?: boolean;
        dateRange?: { start: string; end: string };
    }
): string {
    const teacherMap = new Map(teachers.map((t) => [t.id, t.name]));
    const lines: string[] = [];

    // Header
    if (options?.includeHeader !== false) {
        lines.push(
            [
                "Tarih",
                "Öğrenci",
                "Dosya No",
                "Tür",
                "Yeni",
                "Tanı Sayısı",
                "Test",
                "Puan",
                "Atanan Öğretmen",
                "Atama Nedeni",
            ]
                .map(csvEscape)
                .join(",")
        );
    }

    // Data rows
    for (const c of cases) {
        const row = [
            formatDateShort(c.createdAt),
            c.student,
            c.fileNo || "-",
            humanType(c.type),
            c.isNew ? "Evet" : "Hayır",
            c.diagCount,
            c.isTest ? "Evet" : "Hayır",
            c.score,
            c.assignedTo ? teacherMap.get(c.assignedTo) || "?" : "-",
            c.assignReason || "-",
        ];
        lines.push(row.map(csvEscape).join(","));
    }

    return lines.join("\n");
}

/**
 * Export teachers to CSV format
 */
export function exportTeachersToCsv(
    teachers: Teacher[],
    options?: {
        includeInactive?: boolean;
    }
): string {
    const lines: string[] = [];

    // Header
    lines.push(
        [
            "Ad Soyad",
            "Aktif",
            "Devamsız",
            "Yıllık Yük",
            "Testör",
            "Pushover Key",
        ]
            .map(csvEscape)
            .join(",")
    );

    // Filter if needed
    const filtered = options?.includeInactive
        ? teachers
        : teachers.filter((t) => t.active);

    // Data rows
    for (const t of filtered) {
        const row = [
            t.name,
            t.active ? "Evet" : "Hayır",
            t.isAbsent ? "Evet" : "Hayır",
            t.yearlyLoad,
            t.isTester ? "Evet" : "Hayır",
            t.pushoverKey ? "Var" : "-",
        ];
        lines.push(row.map(csvEscape).join(","));
    }

    return lines.join("\n");
}

/**
 * Download string as file
 */
export function downloadFile(
    content: string,
    filename: string,
    mimeType = "text/csv;charset=utf-8;"
): void {
    const blob = new Blob(["\ufeff" + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate unique filename with date
 */
export function generateFilename(
    prefix: string,
    extension: string,
    date?: Date
): string {
    const d = date || new Date();
    const dateStr = d.toISOString().slice(0, 10);
    return `${prefix}_${dateStr}.${extension}`;
}

/**
 * Export and download cases as CSV
 */
export function downloadCasesAsCsv(
    cases: CaseFile[],
    teachers: Teacher[],
    filename?: string
): void {
    const csv = exportCasesToCsv(cases, teachers);
    const name = filename || generateFilename("dosyalar", "csv");
    downloadFile(csv, name);
}

/**
 * Export and download teachers as CSV
 */
export function downloadTeachersAsCsv(
    teachers: Teacher[],
    filename?: string
): void {
    const csv = exportTeachersToCsv(teachers, { includeInactive: true });
    const name = filename || generateFilename("ogretmenler", "csv");
    downloadFile(csv, name);
}

/**
 * Generate monthly report data
 */
export function generateMonthlyReportData(
    history: Record<string, CaseFile[]>,
    teachers: Teacher[],
    yearMonth: string
): Array<{
    teacherName: string;
    totalCases: number;
    totalScore: number;
}> {
    const teacherMap = new Map(teachers.map((t) => [t.id, t.name]));
    const stats: Map<string, { cases: number; score: number }> = new Map();

    // Initialize all teachers
    for (const t of teachers) {
        if (t.active) {
            stats.set(t.id, { cases: 0, score: 0 });
        }
    }

    // Aggregate data from history
    for (const [date, cases] of Object.entries(history)) {
        if (!date.startsWith(yearMonth)) continue;

        for (const c of cases) {
            if (!c.assignedTo) continue;
            const current = stats.get(c.assignedTo) || { cases: 0, score: 0 };
            current.cases += 1;
            current.score += c.score;
            stats.set(c.assignedTo, current);
        }
    }

    // Convert to array
    return Array.from(stats.entries())
        .map(([id, data]) => ({
            teacherName: teacherMap.get(id) || "?",
            totalCases: data.cases,
            totalScore: data.score,
        }))
        .sort((a, b) => b.totalCases - a.totalCases);
}
