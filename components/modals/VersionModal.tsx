// ============================================
// Versiyon Bildirim Modalı
// ============================================

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { APP_VERSION, CHANGELOG } from "@/lib/constants";

interface VersionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VersionModal({ isOpen, onClose }: VersionModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white relative">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Yeni Güncelleme!</h2>
                            <p className="text-white/80 text-sm">Versiyon {APP_VERSION}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="font-semibold text-slate-800 mb-3">
                        Bu güncellemede neler var?
                    </h3>
                    <ul className="space-y-2">
                        {CHANGELOG[APP_VERSION]?.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <Button className="w-full" onClick={onClose}>
                        Anladım, Devam Et
                    </Button>
                </div>
            </div>
        </div>
    );
}
