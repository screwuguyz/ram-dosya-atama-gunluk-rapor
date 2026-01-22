
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/stores/useAppStore";

interface FeedbackModalProps {
    open: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [type, setType] = useState<string>("oneri");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const addToast = useAppStore(s => s.addToast);

    if (!open) return null;

    async function handleSubmit() {
        const payload = { name: name.trim(), email: email.trim(), type, message: message.trim() };

        // page.tsx logic was: if (!payload.name || !payload.email || payload.message.length < 10)
        if (!payload.name || !payload.email || payload.message.length < 10) {
            addToast("Hata: Lütfen ad, e-posta ve en az 10 karakterlik mesaj girin.");
            return;
        }

        setSending(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                addToast("Başarı: Gönderildi. Teşekkür ederiz!");
                onClose();
                // Reset form
                setName("");
                setEmail("");
                setMessage("");
                setType("oneri");
            } else {
                const j = await res.json().catch(() => ({}));
                addToast("Hata: Gönderilemedi: " + (j?.error || res.statusText));
            }
        } catch {
            addToast("Hata: Ağ hatası: Gönderilemedi");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed inset-0 h-screen w-screen bg-black/30 backdrop-blur-sm flex items-center justify-center z-[99999]" onClick={onClose}>
            <Card className="w-[420px] shadow-2xl border-0" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="text-2xl">💬</span>
                        <span>Öneri / Şikayet</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <Label>Ad Soyad</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ad Soyad" />
                        </div>
                        <div>
                            <Label>E‑posta</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@eposta.com" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="whitespace-nowrap">Tür</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tür seç" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="oneri">Öneri</SelectItem>
                                    <SelectItem value="sikayet">Şikayet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Mesaj</Label>
                            <textarea
                                className="w-full border rounded-md p-2 text-sm min-h-28"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Mesajınızı yazın..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" onClick={onClose}>Kapat</Button>
                        <Button onClick={handleSubmit} disabled={sending}>
                            {sending ? "Gönderiliyor..." : "Gönder"}
                        </Button>
                    </div>
                    <div className="text-[11px] text-muted-foreground">Gönderimler <strong>ataafurkan@gmail.com</strong> adresine iletilir.</div>
                </CardContent>
            </Card>
        </div>
    );
}
