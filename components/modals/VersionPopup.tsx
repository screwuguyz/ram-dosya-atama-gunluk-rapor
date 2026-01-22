
import React from "react";
import { X } from "lucide-react";
import { APP_VERSION, LS_KEYS, CHANGELOG } from "@/lib/constants";

interface VersionPopupProps {
    open: boolean;
    onClose: () => void;
}

export default function VersionPopup({ open, onClose }: VersionPopupProps) {
    if (!open) return null;

    return (
        <div className="fixed top-3 right-3 z-[150] max-w-md animate-slide-in-right">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl shadow-2xl border border-teal-400/30 overflow-hidden">
                <div className="flex items-start justify-between p-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">✨</span>
                            <h3 className="font-bold text-lg">Uygulama Güncellendi</h3>
                        </div>
                        <div className="text-sm font-semibold mb-3 opacity-90">
                            Versiyon {APP_VERSION}
                        </div>
                        <div className="text-sm space-y-1 mb-3">
                            <div className="font-medium mb-1">Yapılan Değişiklikler:</div>
                            <ul className="list-disc list-inside space-y-0.5 text-xs opacity-90">
                                {CHANGELOG[APP_VERSION]?.map((change: string, idx: number) => (
                                    <li key={idx}>{change}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-xs font-medium bg-white/20 rounded px-2 py-1 inline-block mt-2">
                            🔄 Sayfayı yenileyin
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            try {
                                localStorage.setItem(LS_KEYS.LAST_SEEN_VERSION, APP_VERSION);
                            } catch { }
                            onClose();
                        }}
                        className="ml-3 text-white/80 hover:text-white hover:bg-white/20 rounded p-1 transition-colors"
                        aria-label="Kapat"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
