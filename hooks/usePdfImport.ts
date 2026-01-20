// ============================================
// RAM Dosya Atama - PDF Import Hook
// ============================================

"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { useAppStore } from "@/stores/useAppStore";
import { API_ENDPOINTS } from "@/lib/constants";
import type { PdfAppointment } from "@/types";

interface PdfImportHook {
    // State
    pdfFile: File | null;
    pdfUploading: boolean;
    pdfUploadError: string | null;
    pdfLoading: boolean;
    isDragging: boolean;

    // Methods
    setPdfFile: (file: File | null) => void;
    setIsDragging: (dragging: boolean) => void;
    fetchPdfEntries: (date?: Date) => Promise<void>;
    uploadPdf: () => Promise<boolean>;
    clearPdf: () => Promise<void>;
    removePdfEntry: (id: string) => void;

    // Computed
    pendingAppointmentsCount: number;
    activePdfEntry: PdfAppointment | null;
}

export function usePdfImport(): PdfImportHook {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUploading, setPdfUploading] = useState(false);
    const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const {
        pdfEntries,
        pdfDate,
        pdfDateIso,
        selectedPdfEntryId,
        cases,
        history,
        setPdfEntries,
        setPdfDate,
        setPdfDateIso,
        setSelectedPdfEntryId,
        addToast,
    } = useAppStore();

    // Fetch PDF entries from server
    const fetchPdfEntries = useCallback(
        async (date?: Date) => {
            setPdfLoading(true);
            try {
                let url = API_ENDPOINTS.PDF_IMPORT;
                if (date) {
                    const dateIso = format(date, "yyyy-MM-dd");
                    url += `?date=${dateIso}`;
                }
                const res = await fetch(url, { cache: "no-store" });
                const json = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setPdfEntries([]);
                    setPdfDate(null);
                    setPdfDateIso(null);
                    if (date) addToast("Seçilen tarih için randevu listesi bulunamadı.");
                    return;
                }

                setPdfEntries(Array.isArray(json.entries) ? json.entries : []);
                setPdfDate(json?.date || null);
                setPdfDateIso(json?.dateIso || null);
            } catch (err) {
                console.warn("pdf fetch failed", err);
                setPdfEntries([]);
                setPdfDate(null);
                setPdfDateIso(null);
            } finally {
                setPdfLoading(false);
            }
        },
        [setPdfEntries, setPdfDate, setPdfDateIso, addToast]
    );

    // Upload PDF file
    const uploadPdf = useCallback(async (): Promise<boolean> => {
        if (!pdfFile) {
            setPdfUploadError("Lütfen bir PDF dosyası seçin.");
            return false;
        }

        setPdfUploading(true);
        setPdfUploadError(null);

        try {
            const formData = new FormData();
            formData.append("file", pdfFile);

            const res = await fetch(API_ENDPOINTS.PDF_IMPORT, {
                method: "POST",
                body: formData,
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setPdfUploadError(json.error || "PDF yüklenemedi.");
                return false;
            }

            setPdfEntries(Array.isArray(json.entries) ? json.entries : []);
            setPdfDate(json?.date || null);
            setPdfDateIso(json?.dateIso || null);
            setPdfFile(null);
            addToast("PDF başarıyla yüklendi.");
            return true;
        } catch (err) {
            console.error("pdf upload failed", err);
            setPdfUploadError("PDF yüklenirken hata oluştu.");
            return false;
        } finally {
            setPdfUploading(false);
        }
    }, [pdfFile, setPdfEntries, setPdfDate, setPdfDateIso, addToast]);

    // Clear all PDF entries
    const clearPdf = useCallback(async () => {
        try {
            const res = await fetch(API_ENDPOINTS.PDF_IMPORT, { method: "DELETE" });
            if (res.ok) {
                setPdfEntries([]);
                setPdfDate(null);
                setPdfDateIso(null);
                setSelectedPdfEntryId(null);
                addToast("PDF temizlendi.");
            }
        } catch (err) {
            console.error("pdf clear failed", err);
        }
    }, [setPdfEntries, setPdfDate, setPdfDateIso, setSelectedPdfEntryId, addToast]);

    // Remove single PDF entry
    const removePdfEntry = useCallback(
        (id: string) => {
            setPdfEntries(pdfEntries.filter((e) => e.id !== id));
            if (selectedPdfEntryId === id) {
                setSelectedPdfEntryId(null);
            }
        },
        [pdfEntries, selectedPdfEntryId, setPdfEntries, setSelectedPdfEntryId]
    );

    // Check if entry is assigned
    const isEntryAssigned = useCallback(
        (entry: PdfAppointment): boolean => {
            const matchesEntry = (source: PdfAppointment | undefined) => {
                if (!source) return false;
                if (source.id === entry.id) return true;
                return (
                    source.time === entry.time &&
                    source.name === entry.name &&
                    (source.fileNo || "") === (entry.fileNo || "")
                );
            };

            const inCases = cases.some((c) => matchesEntry(c.sourcePdfEntry));
            const inHistory = Object.values(history).some((dayCases) =>
                dayCases.some((c) => matchesEntry(c.sourcePdfEntry))
            );

            return inCases || inHistory;
        },
        [cases, history]
    );

    // Count pending (unassigned) appointments
    const pendingAppointmentsCount = pdfEntries.filter(
        (entry) => !isEntryAssigned(entry)
    ).length;

    // Get active PDF entry
    const activePdfEntry =
        pdfEntries.find((e) => e.id === selectedPdfEntryId) || null;

    return {
        pdfFile,
        pdfUploading,
        pdfUploadError,
        pdfLoading,
        isDragging,
        setPdfFile,
        setIsDragging,
        fetchPdfEntries,
        uploadPdf,
        clearPdf,
        removePdfEntry,
        pendingAppointmentsCount,
        activePdfEntry,
    };
}
