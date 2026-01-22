
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    email: string;
    onEmailChange: (value: string) => void;
    password: string;
    onPasswordChange: (value: string) => void;
    remember: boolean;
    onRememberChange: (value: boolean) => void;
    onLogin: () => void;
}

export default function LoginModal({
    open,
    onClose,
    email,
    onEmailChange,
    password,
    onPasswordChange,
    remember,
    onRememberChange,
    onLogin
}: LoginModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-black/30 backdrop-blur-sm flex items-center justify-center z-[99999]">
            <Card className="w-[400px] shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="text-2xl">🔐</span>
                        <span>Admin Girişi</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-1">
                        <Label>E-posta</Label>
                        <Input
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            placeholder="admin@example.com"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onLogin();
                            }}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Parola</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onLogin();
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(v) => onRememberChange(Boolean(v))}
                        />
                        <Label htmlFor="remember" className="text-sm font-normal">Beni Hatırla</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>İptal</Button>
                        <Button onClick={onLogin}>Giriş Yap</Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Sadece yetkili admin işlem yapabilir; diğer kullanıcılar raporları görüntüler.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
