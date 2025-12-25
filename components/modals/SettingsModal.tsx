// ============================================
// Ayarlar Modalı
// ============================================

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Settings, Save, RotateCcw } from "lucide-react";
import type { Settings as SettingsType } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: SettingsType;
    onSave: (settings: SettingsType) => void;
}

export default function SettingsModal({
    isOpen,
    onClose,
    settings,
    onSave,
}: SettingsModalProps) {
    const [localSettings, setLocalSettings] = useState<SettingsType>(settings);

    if (!isOpen) return null;

    const handleChange = (key: keyof SettingsType, value: number) => {
        setLocalSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const handleReset = () => {
        setLocalSettings(DEFAULT_SETTINGS);
    };

    const settingGroups = [
        {
            title: "Genel Ayarlar",
            items: [
                { key: "dailyLimit" as const, label: "Günlük Limit", desc: "Öğretmen başına günlük maksimum dosya", min: 1, max: 20 },
            ],
        },
        {
            title: "Puan Ayarları",
            items: [
                { key: "scoreTypeY" as const, label: "Yönlendirme", desc: "Yönlendirme dosyası puanı", min: 0, max: 10 },
                { key: "scoreTypeD" as const, label: "Destek", desc: "Destek dosyası puanı", min: 0, max: 10 },
                { key: "scoreTypeI" as const, label: "İkisi", desc: "İkisi dosyası puanı", min: 0, max: 10 },
                { key: "scoreNewBonus" as const, label: "Yeni Bonus", desc: "Yeni dosya ek puanı", min: 0, max: 5 },
                { key: "scoreTest" as const, label: "Test Puanı", desc: "Test dosyası sabit puanı", min: 0, max: 20 },
            ],
        },
        {
            title: "Özel Durumlar",
            items: [
                { key: "backupBonusAmount" as const, label: "Yedek Bonus", desc: "Yedekleme sonrası ek puan", min: 0, max: 10 },
                { key: "absencePenaltyAmount" as const, label: "Devamsızlık Cezası", desc: "Devamsızlık sonrası düşürülen puan", min: 0, max: 10 },
            ],
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-slate-600" />
                        <h2 className="text-lg font-semibold text-slate-800">Ayarlar</h2>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh] space-y-6">
                    {settingGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                {group.title}
                            </h3>
                            <div className="space-y-3">
                                {group.items.map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium">{item.label}</Label>
                                            <p className="text-xs text-slate-500">{item.desc}</p>
                                        </div>
                                        <Input
                                            type="number"
                                            min={item.min}
                                            max={item.max}
                                            value={localSettings[item.key]}
                                            onChange={(e) =>
                                                handleChange(item.key, parseInt(e.target.value) || 0)
                                            }
                                            className="w-20 text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleReset}
                        className="text-slate-600"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Varsayılana Dön
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            İptal
                        </Button>
                        <Button type="button" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Kaydet
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
