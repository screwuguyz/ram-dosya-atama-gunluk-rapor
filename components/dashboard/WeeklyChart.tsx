// ============================================
// Haftalık Trend Grafiği Bileşeni
// ============================================

"use client";

import React, { useMemo } from "react";

interface CaseFile {
    id: string;
    createdAt: string;
    absencePenalty?: boolean;
}

interface WeeklyChartProps {
    cases: CaseFile[];
    history: Record<string, CaseFile[]>;
}

// Son 7 günün verilerini hesapla
function getLast7Days(): string[] {
    const days: string[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split("T")[0]);
    }

    return days;
}

// Gün adını al (kısa)
function getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    return days[date.getDay()];
}

export default function WeeklyChart({ cases, history }: WeeklyChartProps) {
    const chartData = useMemo(() => {
        const last7Days = getLast7Days();
        const today = new Date().toISOString().split("T")[0];

        return last7Days.map(date => {
            let count = 0;

            if (date === today) {
                // Bugünün dosyaları
                count = cases.filter(c => !c.absencePenalty).length;
            } else {
                // Geçmiş günlerin dosyaları
                const dayCases = history[date] || [];
                count = dayCases.filter(c => !c.absencePenalty).length;
            }

            return {
                date,
                day: getDayName(date),
                count,
                isToday: date === today,
            };
        });
    }, [cases, history]);

    // Max değer (grafik yüksekliği için)
    const maxCount = Math.max(...chartData.map(d => d.count), 1);

    // Toplam ve ortalama
    const total = chartData.reduce((sum, d) => sum + d.count, 0);
    const avg = (total / 7).toFixed(1);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Başlık */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    📈 Haftalık Trend
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    Ort: <span className="font-medium text-slate-700 dark:text-slate-200">{avg}</span>/gün
                </div>
            </div>

            {/* Grafik */}
            <div className="flex items-end justify-between gap-1 h-24">
                {chartData.map((day, index) => {
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                            {/* Bar */}
                            <div className="w-full flex flex-col items-center justify-end h-20">
                                <div
                                    className={`w-full max-w-8 rounded-t transition-all duration-300 ${day.isToday
                                            ? "bg-gradient-to-t from-teal-600 to-teal-400"
                                            : "bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500"
                                        }`}
                                    style={{ height: `${Math.max(height, 4)}%` }}
                                    title={`${day.date}: ${day.count} dosya`}
                                />
                            </div>

                            {/* Sayı */}
                            <div className={`text-xs font-medium ${day.isToday ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-slate-400"
                                }`}>
                                {day.count}
                            </div>

                            {/* Gün adı */}
                            <div className={`text-xs ${day.isToday
                                    ? "text-teal-600 dark:text-teal-400 font-semibold"
                                    : "text-slate-400 dark:text-slate-500"
                                }`}>
                                {day.day}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Alt bilgi */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Son 7 gün</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    Toplam: {total} dosya
                </span>
            </div>
        </div>
    );
}
