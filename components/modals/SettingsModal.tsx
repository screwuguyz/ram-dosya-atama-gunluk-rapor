
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, X } from "lucide-react";
import ThemeSettings from "@/components/ThemeSettings";
import DashboardWidgets from "@/components/DashboardWidgets";
import { Settings } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    settings: Settings;
    updateSettings: (updates: Partial<Settings>) => void;
    onCleanupEArchive: () => void;
}

export default function SettingsModal({
    open,
    onClose,
    settings,
    updateSettings,
    onCleanupEArchive,
}: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<"general" | "theme" | "widgets">("general");

    if (!open) return null;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-black/30 backdrop-blur-sm flex items-center justify-center z-[99999]" onClick={onClose}>
            <Card className="w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl border-0" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <span className="text-2xl">⚙️</span>
                            <span>Ayarlar</span>
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    {/* Tab Navigation */}
                    <div className="flex gap-2 mt-4">
                        <Button
                            variant={activeTab === "general" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab("general")}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                            Genel
                        </Button>
                        <Button
                            variant={activeTab === "theme" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab("theme")}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                            🎨 Tema
                        </Button>
                        <Button
                            variant={activeTab === "widgets" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab("widgets")}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                            📊 Widget'lar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    {activeTab === "general" && (
                        <>
                            <div>
                                <Label className="text-slate-900 font-semibold">Günlük Limit (öğretmen başına)</Label>
                                <Input type="number" value={settings.dailyLimit} onChange={e => updateSettings({ dailyLimit: Math.max(1, Number(e.target.value) || 0) })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-slate-900 font-semibold">Test Puanı</Label>
                                    <Input type="number" value={settings.scoreTest} onChange={e => updateSettings({ scoreTest: Number(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <Label className="text-slate-900 font-semibold">Yeni Bonus</Label>
                                    <Input type="number" value={settings.scoreNewBonus} onChange={e => updateSettings({ scoreNewBonus: Number(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <Label className="text-slate-900 font-semibold">Yönlendirme</Label>
                                    <Input type="number" value={settings.scoreTypeY} onChange={e => updateSettings({ scoreTypeY: Number(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <Label className="text-slate-900 font-semibold">Destek</Label>
                                    <Input type="number" value={settings.scoreTypeD} onChange={e => updateSettings({ scoreTypeD: Number(e.target.value) || 0 })} />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-slate-900 font-semibold">İkisi</Label>
                                    <Input type="number" value={settings.scoreTypeI} onChange={e => updateSettings({ scoreTypeI: Number(e.target.value) || 0 })} />
                                </div>
                            </div>
                            {/* Yedek Başkan Bonus Ayarları */}
                            <div className="border-t border-slate-200 pt-4 mt-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                                    <Label className="text-sm font-semibold mb-2 block text-amber-900 flex items-center gap-2">
                                        <span>👑</span>
                                        <span>Yedek Başkan Bonus Ayarları</span>
                                    </Label>
                                    <div>
                                        <Label className="text-xs text-slate-900 font-semibold">Bonus Miktarı (En Yüksek + X)</Label>
                                        <Input type="number" min={0} value={settings.backupBonusAmount} onChange={e => updateSettings({ backupBonusAmount: Math.max(0, Number(e.target.value) || 0) })} />
                                    </div>
                                    <p className="text-[11px] text-amber-700 mt-1">
                                        Yedek başkan: O günün en yüksek puanına +{settings.backupBonusAmount} eklenir.
                                    </p>
                                </div>
                            </div>
                            {/* Devamsızlık Cezası Ayarları */}
                            <div className="border-t border-slate-200 pt-4 mt-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                    <Label className="text-sm font-semibold mb-2 block text-red-900 flex items-center gap-2">
                                        <span>🚫</span>
                                        <span>Devamsızlık Cezası Ayarları</span>
                                    </Label>
                                    <div>
                                        <Label className="text-xs text-slate-900 font-semibold">Puan Farkı (En Düşük - X)</Label>
                                        <Input type="number" min={0} value={settings.absencePenaltyAmount} onChange={e => updateSettings({ absencePenaltyAmount: Math.max(0, Number(e.target.value) || 0) })} />
                                    </div>
                                    <p className="text-[11px] text-red-700 mt-1">
                                        Devamsız öğretmen: O günün en düşük puanından -{settings.absencePenaltyAmount} çıkarılır.
                                    </p>
                                </div>
                            </div>

                            {/* Geliştirici Ayarları (Debug Mode) */}
                            <div className="border-t border-slate-200 pt-4 mt-4">
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                                    <Label className="text-sm font-semibold mb-2 block text-slate-900 flex items-center gap-2">
                                        <span>🛠️</span>
                                        <span>Geliştirici Seçenekleri</span>
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="debugMode"
                                            checked={!!settings.debugMode}
                                            onCheckedChange={(v) => updateSettings({ debugMode: !!v })}
                                            className="h-5 w-5 border-slate-400 data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor="debugMode" className="text-sm font-semibold cursor-pointer">Debug Modu (Detaylı Analiz)</Label>
                                            <p className="text-[11px] text-slate-600 mt-0.5">
                                                Her atama işleminden sonra; kazanan öğretmeni, adayları ve özellikle Eray ile ilgili engelleme nedenlerini gösteren bilgi penceresini açar.
                                            </p>
                                        </div>
                                    </div>

                                    {/* E-Arşiv Temizliği Butonu */}
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={onCleanupEArchive}
                                            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            E-Arşiv Temizliği (Hayalet Kayıtları Sil)
                                        </Button>
                                        <p className="text-[10px] text-slate-500 mt-1 text-center">
                                            Silinmiş ama listede kalan dosyaları temizler.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                                <Button variant="outline" onClick={() => updateSettings(DEFAULT_SETTINGS)}>Varsayılanlara Dön</Button>
                                <Button onClick={onClose}>Kapat</Button>
                            </div>
                        </>
                    )}

                    {activeTab === "theme" && (
                        <div className="space-y-4">
                            <ThemeSettings />
                            <div className="flex justify-end gap-2 pt-1">
                                <Button onClick={onClose}>Kapat</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === "widgets" && (
                        <div className="space-y-4">
                            <DashboardWidgets />
                            <div className="flex justify-end gap-2 pt-1">
                                <Button onClick={onClose}>Kapat</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
