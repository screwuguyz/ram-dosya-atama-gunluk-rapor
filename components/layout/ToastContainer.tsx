// ============================================
// Toast Container Bileşeni
// ============================================

"use client";

import React from "react";
import { useAppStore } from "@/stores/useAppStore";
import { X } from "lucide-react";

export default function ToastContainer() {
    const toasts = useAppStore((state) => state.toasts);
    const removeToast = useAppStore((state) => state.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-[400px] animate-slide-in-right"
                >
                    <span className="flex-1 text-sm">{toast.text}</span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
