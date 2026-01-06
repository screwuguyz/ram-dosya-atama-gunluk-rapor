"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { getTodayYmd } from "@/lib/date";

export default function DebugPage() {
    const { teachers, cases, settings } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return <div className="p-8">Yükleniyor...</div>;

    const today = getTodayYmd();

    // 1. Son atanan kişiyi bul (Page.tsx mantığıyla aynı)
    const sortedCases = [...cases].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastCase = sortedCases.length > 0 ? sortedCases[0] : null;
    const lastTid = lastCase?.assignedTo;

    // 2. Rapor oluştur
    const activeTeachersCount = teachers.filter(t => t.active).length;

    const report = teachers.map(t => {
        const logs: string[] = [];
        let isEligible = true;
        let status = "ADAY"; // Başlangıç durumu

        // Filtreler
        if (t.isPhysiotherapist) { isEligible = false; logs.push("Fizyoterapist"); }
        if (t.isAbsent) { isEligible = false; logs.push("Devamsız"); }
        if (!t.active) { isEligible = false; logs.push("İnaktif"); }

        // Yedek Günü Kontrolü
        const isBackup = t.backupDay === today;
        if (isBackup) { isEligible = false; logs.push(`Bugün Yedek (${t.backupDay})`); }

        // Günlük Limit
        const dailyCount = cases.filter(c => c.assignedTo === t.id && c.createdAt.startsWith(today)).length;
        if (dailyCount >= settings.dailyLimit) { isEligible = false; logs.push(`Limit Dolu (${dailyCount}/${settings.dailyLimit})`); }

        // Rotasyon
        // Eğer 1'den fazla aktif öğretmen varsa ve bu kişi son atanan kişi ise
        let rotationBlocked = false;
        if (activeTeachersCount > 1 && lastTid && lastTid === t.id) {
            rotationBlocked = true;
            // Eğer yukarıdaki sebeplerden elenmediyse, rotasyon sebebiyle elendi diyelim
            if (isEligible) {
                isEligible = false;
                logs.push("🔴 ROTASYON ENGELİ (Son dosya bu kişiye atanmış)");
            }
        }

        if (!isEligible) {
            status = "ELENDİ";
        }

        return { ...t, status, logs, dailyCount, rotationBlocked, isBackup };
    });

    // 3. Sıralama (Adayları page.tsx'teki yeni mantığa göre sırala)
    const candidates = report.filter(r => r.status === "ADAY");

    candidates.sort((a, b) => {
        // DİKKAT: Artık yearlyLoad kullanıyoruz
        const byLoad = a.yearlyLoad - b.yearlyLoad;
        if (byLoad !== 0) return byLoad;

        const byCount = a.dailyCount - b.dailyCount;
        if (byCount !== 0) return byCount;

        return 0; // Random kısmını simüle etmiyoruz ama puan eşitse önemli
    });

    const winner = candidates.length > 0 ? candidates[0] : null;

    return (
        <div className="p-8 max-w-6xl mx-auto font-mono text-sm">
            <h1 className="text-3xl font-bold mb-6 text-indigo-600">🕵️‍♂️ Atama Dedektifi (Debug Modu)</h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow border border-indigo-100">
                    <h2 className="font-bold text-lg mb-2 text-gray-700">Sistem Bilgisi</h2>
                    <div className="space-y-1">
                        <div>📅 Bugün: <span className="font-bold">{today}</span></div>
                        <div>📊 Toplam Case: <span className="font-bold">{cases.length}</span></div>
                        <div>🚧 Günlük Limit: <span className="font-bold">{settings.dailyLimit}</span></div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded shadow border border-indigo-100">
                    <h2 className="font-bold text-lg mb-2 text-gray-700">Son Atama Durumu</h2>
                    <div className="space-y-1">
                        <div>👤 Son Dosya Alan ID: <span className="font-bold font-mono">{lastTid || "YOK"}</span></div>
                        <div>🏷️ İsim: <span className="font-bold text-blue-600">{teachers.find(t => t.id === lastTid)?.name || "Bulunamadı"}</span></div>
                        <div className="text-xs text-gray-500 mt-2">NOT: Rotasyon kuralı bu kişiyi bir sonraki turda engeller.</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-3">Öğretmen</th>
                            <th className="p-3">Durum</th>
                            <th className="p-3">Yıllık Yük</th>
                            <th className="p-3">Günlük Sayı</th>
                            <th className="p-3">Yedek?</th>
                            <th className="p-3">Sebep / Engel</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {report.map(r => {
                            const isWinner = winner?.id === r.id;
                            return (
                                <tr key={r.id} className={
                                    isWinner ? "bg-green-100 border-l-4 border-green-500" :
                                        r.status === "ELENDİ" ? "bg-red-50 opacity-75" :
                                            "bg-white"
                                }>
                                    <td className="p-3 font-bold flex items-center gap-2">
                                        {r.name}
                                        {isWinner && <span className="text-green-600 text-xs px-2 py-0.5 bg-green-200 rounded-full">KAZANAN</span>}
                                        {r.id === lastTid && <span className="text-blue-600 text-xs px-2 py-0.5 bg-blue-100 rounded-full">SON ALAN</span>}
                                    </td>
                                    <td className="p-3 font-bold">
                                        <span className={r.status === "ADAY" ? "text-green-600" : "text-red-600"}>{r.status}</span>
                                    </td>
                                    <td className="p-3 font-mono text-lg">{r.yearlyLoad}</td>
                                    <td className="p-3">{r.dailyCount}</td>
                                    <td className="p-3 text-xs">{r.isBackup ? "EVET" : "-"} ({r.backupDay || "Yok"})</td>
                                    <td className="p-3 text-red-600 font-medium text-xs">
                                        {r.logs.map((L, i) => <div key={i}>• {L}</div>)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-6 bg-indigo-900 text-white rounded-xl text-center shadow-lg">
                <div className="text-sm uppercase tracking-wide opacity-75">Sıradaki Tahmini Atama</div>
                <div className="text-4xl font-bold mt-2">
                    {winner ? `🏆 ${winner.name}` : "⛔ UYGUN ADAY YOK"}
                </div>
                <div className="mt-2 text-indigo-200 text-sm">
                    (Puanı en düşük ve engeli olmayan kişi)
                </div>
            </div>
        </div>
    );
}
