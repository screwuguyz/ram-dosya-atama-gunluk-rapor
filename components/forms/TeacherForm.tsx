// ============================================
// Öğretmen Ekleme/Düzenleme Formu
// ============================================

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, UserPlus, X } from "lucide-react";

interface TeacherFormProps {
    onSubmit: (data: TeacherFormData) => void;
    onCancel?: () => void;
    initialData?: TeacherFormData;
    isEditing?: boolean;
    disabled?: boolean;
}

export interface TeacherFormData {
    name: string;
    isTester: boolean;
    pushoverKey?: string;
}

export default function TeacherForm({
    onSubmit,
    onCancel,
    initialData,
    isEditing = false,
    disabled = false,
}: TeacherFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [isTester, setIsTester] = useState(initialData?.isTester || false);
    const [pushoverKey, setPushoverKey] = useState(initialData?.pushoverKey || "");
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        onSubmit({
            name: name.trim(),
            isTester,
            pushoverKey: pushoverKey.trim() || undefined,
        });

        // Reset form if not editing
        if (!isEditing) {
            setName("");
            setIsTester(false);
            setPushoverKey("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                    <Label htmlFor="teacher-name">
                        {isEditing ? "Öğretmen Adı" : "Yeni Öğretmen Ekle"}
                    </Label>
                    <Input
                        id="teacher-name"
                        placeholder="Öğretmen adı..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={disabled}
                        className="w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-slate-50">
                        <Checkbox
                            id="teacher-tester"
                            checked={isTester}
                            onCheckedChange={(checked) => setIsTester(checked === true)}
                            disabled={disabled}
                        />
                        <Label htmlFor="teacher-tester" className="text-sm cursor-pointer">
                            Testör
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        disabled={!name.trim() || disabled}
                        size="sm"
                    >
                        {isEditing ? (
                            <>Kaydet</>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-1.5" />
                                Ekle
                            </>
                        )}
                    </Button>

                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Advanced options */}
            <div>
                <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? "Gelişmiş ayarları gizle" : "Gelişmiş ayarlar"}
                </button>

                {showAdvanced && (
                    <div className="mt-2 p-3 border rounded-md bg-slate-50 space-y-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="pushover-key" className="text-xs">
                                Pushover User Key (Bildirim için)
                            </Label>
                            <Input
                                id="pushover-key"
                                placeholder="u1234567890abcdef..."
                                value={pushoverKey}
                                onChange={(e) => setPushoverKey(e.target.value)}
                                disabled={disabled}
                                className="text-sm"
                            />
                            <p className="text-xs text-slate-400">
                                Öğretmenin Pushover uygulamasına bildirim göndermek için gerekli
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
