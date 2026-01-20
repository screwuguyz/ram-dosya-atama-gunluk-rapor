// ============================================
// Öneri/Şikayet Modal
// ============================================

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Send, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { API_ENDPOINTS } from "@/lib/constants";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [type, setType] = useState<"oneri" | "sikayet">("oneri");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const addToast = useAppStore((state) => state.addToast);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            addToast("Lütfen mesajınızı yazın.");
            return;
        }

        setSending(true);

        try {
            const res = await fetch(API_ENDPOINTS.FEEDBACK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim() || "Anonim",
                    email: email.trim() || null,
                    type,
                    message: message.trim(),
                }),
            });

            if (res.ok) {
                addToast("Geri bildiriminiz alındı. Teşekkürler!");
                setName("");
                setEmail("");
                setMessage("");
                setType("oneri");
                onClose();
            } else {
                const data = await res.json().catch(() => ({}));
                addToast(data.error || "Gönderim başarısız oldu.");
            }
        } catch (err) {
            console.error("Feedback error:", err);
            addToast("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">
                        💬 Öneri / Şikayet
                    </h2>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="fb-name">Ad Soyad</Label>
                            <Input
                                id="fb-name"
                                placeholder="Opsiyonel"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="fb-email">E-posta</Label>
                            <Input
                                id="fb-email"
                                type="email"
                                placeholder="Opsiyonel"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="fb-type">Tür</Label>
                        <Select
                            value={type}
                            onValueChange={(v) => setType(v as "oneri" | "sikayet")}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="oneri">💡 Öneri</SelectItem>
                                <SelectItem value="sikayet">⚠️ Şikayet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="fb-message">Mesajınız</Label>
                        <textarea
                            id="fb-message"
                            className="w-full min-h-[120px] p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Görüşlerinizi buraya yazın..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            İptal
                        </Button>
                        <Button type="submit" disabled={sending || !message.trim()}>
                            {sending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Gönderiliyor...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Gönder
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
