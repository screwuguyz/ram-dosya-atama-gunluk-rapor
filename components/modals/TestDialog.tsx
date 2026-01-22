
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Teacher, CaseFile } from "@/types";

interface TestDialogProps {
    open: boolean;
    chosenTeacher: Teacher | null;
    pendingCase: CaseFile | null;
    confirmType?: 'testNotFinished' | 'testerProtection';
    onClose: () => void;
    onConfirm: () => void;
    onSkip: () => void;
}

export default function TestDialog({
    open,
    chosenTeacher,
    pendingCase,
    confirmType,
    onClose,
    onConfirm,
    onSkip
}: TestDialogProps) {
    if (!open || !chosenTeacher) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]" onClick={onClose}>
            <Card className="w-[420px] shadow-2xl border-0 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <CardHeader className={`text-white rounded-t-lg ${confirmType === 'testerProtection' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="text-2xl">{confirmType === 'testerProtection' ? '🛡️' : '⏱️'}</span>
                        <span>{confirmType === 'testerProtection' ? 'Testör Koruma' : 'Test Bitti Mi?'}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${confirmType === 'testerProtection' ? 'bg-purple-100' : 'bg-amber-100'}`}>
                            <span className="text-3xl">{confirmType === 'testerProtection' ? '👨‍🏫' : '🧪'}</span>
                        </div>
                        <p className="text-lg font-medium text-slate-900 mb-2">
                            <span className={`font-bold ${confirmType === 'testerProtection' ? 'text-purple-600' : 'text-amber-600'}`}>{chosenTeacher.name}</span>
                        </p>
                        {confirmType === 'testerProtection' ? (
                            <p className="text-slate-600 text-sm">
                                Bu öğretmen <strong>testör</strong> olarak seçili.
                                <br />
                                Normal dosya mı verilsin, yoksa test dosyası için mi beklesin?
                            </p>
                        ) : (
                            <p className="text-slate-600 text-sm">
                                Bu öğretmen bugün test dosyası aldı.
                                <br />
                                Yeni dosya atanacak ama test henüz bitmemiş olabilir.
                            </p>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-700">
                            <span>📁</span>
                            <span className="font-medium">Atanacak Dosya:</span>
                            <span>{pendingCase?.student}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 mt-1">
                            <span>⭐</span>
                            <span className="font-medium">Puan:</span>
                            <span>{pendingCase?.score}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={onConfirm}
                        >
                            {confirmType === 'testerProtection' ? '✅ Verilsin' : '✅ Test Bitti, Ata'}
                        </Button>
                        <Button
                            className={`flex-1 text-white ${confirmType === 'testerProtection' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                            onClick={onSkip}
                        >
                            {confirmType === 'testerProtection' ? '🛡️ Atlansın, Test Beklesin' : '⏭️ Bitmedi, Atla'}
                        </Button>
                    </div>

                    <p className="text-xs text-center text-slate-500">
                        {confirmType === 'testerProtection'
                            ? '"Atlansın" seçerseniz dosya sıradaki öğretmene verilir, testör test için bekler'
                            : '"Atla" seçerseniz dosya sıradaki uygun öğretmene verilecek'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
