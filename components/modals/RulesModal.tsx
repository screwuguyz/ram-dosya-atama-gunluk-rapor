
import React from "react";
import { X } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

interface RulesModalProps {
    open: boolean;
    onClose: () => void;
}

export default function RulesModal({ open, onClose }: RulesModalProps) {
    const settings = useAppStore(s => s.settings);

    if (!open) return null;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-2xl shadow-xl border border-emerald-100/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 border-b border-emerald-800/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">📋</span>
                        <span>Dosya Atama Kuralları</span>
                    </h2>
                    <p className="text-emerald-100 text-sm mt-1">Sistemin otomatik dosya atama mantığı ve puanlama kuralları</p>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    <div className="grid gap-4 md:gap-5">
                        {/* Rule 1 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-bold text-sm">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Test Dosyaları</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">Sadece testör öğretmenlere gider; aynı gün ikinci test verilmez.</p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 2 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Normal Dosya Uygunluk</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        Aktif olmalı, devamsız olmamalı, yedek değilse ve günlük sınır (<span className="font-semibold text-blue-600">{settings.dailyLimit}</span>) aşılmamış olmalı. Testörler test almış olsa da normal dosya alabilir.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 3 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-sm">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Sıralama</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        Yıllık yük az → Bugün aldığı dosya az → Rastgele; mümkünse son atanan öğretmene arka arkaya verilmez.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 4 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-cyan-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-700 font-bold text-sm">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Günlük Sınır</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        Öğretmen başına günde en fazla <span className="font-semibold text-cyan-600">{settings.dailyLimit}</span> dosya.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 5 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-bold text-sm">
                                    5
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Manuel Atama</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">Admin manuel öğretmen seçerse otomatik seçim devre dışı kalır.</p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 6 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 font-bold text-sm">
                                    6
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Devamsız</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        Devamsız olan öğretmene dosya verilmez; gün sonunda devamsızlar için o gün en düşük puanın <span className="font-semibold text-orange-600">{settings.absencePenaltyAmount}</span> eksiği "denge puanı" eklenir.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 7 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-bold text-sm">
                                    7
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Başkan Yedek</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        Yedek işaretli öğretmen o gün dosya almaz; gün sonunda diğerlerinin en yüksek günlük puanına <span className="font-semibold text-amber-600">+{settings.backupBonusAmount}</span> eklenir.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 8 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-sm">
                                    8
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Puanlama</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        TEST = <span className="font-semibold text-emerald-600">{settings.scoreTest}</span>; YÖNLENDİRME = <span className="font-semibold text-emerald-600">{settings.scoreTypeY}</span>; DESTEK = <span className="font-semibold text-emerald-600">{settings.scoreTypeD}</span>; İKİSİ = <span className="font-semibold text-emerald-600">{settings.scoreTypeI}</span>; YENİ = <span className="font-semibold text-emerald-600">+{settings.scoreNewBonus}</span>; TANI = 0–6 (üst sınır 6).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 9 */}
                        <div className="bg-white rounded-xl p-5 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-sm">
                                    9
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1.5">Bildirim</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">Atama sonrası öğretmene bildirim gönderilir.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GÖRSEL ÖRNEK BÖLÜMÜ */}
                    <div className="mt-8 pt-6 border-t-2 border-emerald-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            <span>Örnek Senaryo</span>
                        </h3>

                        {/* Örnek Tablo */}
                        <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 mb-6">
                            <h4 className="font-semibold text-slate-700 mb-3">Öğretmen Durumu:</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold">Öğretmen</th>
                                            <th className="px-3 py-2 text-center font-semibold">Yıllık</th>
                                            <th className="px-3 py-2 text-center font-semibold">Günlük</th>
                                            <th className="px-3 py-2 text-center font-semibold">Aylık</th>
                                            <th className="px-3 py-2 text-left font-semibold">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr className="bg-emerald-50">
                                            <td className="px-3 py-2 font-medium">A</td>
                                            <td className="px-3 py-2 text-center font-bold text-emerald-600">10</td>
                                            <td className="px-3 py-2 text-center">0</td>
                                            <td className="px-3 py-2 text-center">5</td>
                                            <td className="px-3 py-2"><span className="text-emerald-600">✅ Hazır</span></td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 font-medium">B</td>
                                            <td className="px-3 py-2 text-center">11</td>
                                            <td className="px-3 py-2 text-center">1</td>
                                            <td className="px-3 py-2 text-center">6</td>
                                            <td className="px-3 py-2"><span className="text-emerald-600">✅ Hazır</span></td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 font-medium">C</td>
                                            <td className="px-3 py-2 text-center">12</td>
                                            <td className="px-3 py-2 text-center">0</td>
                                            <td className="px-3 py-2 text-center">7</td>
                                            <td className="px-3 py-2"><span className="text-amber-600">⏭️ Son aldı</span></td>
                                        </tr>
                                        <tr className="bg-red-50">
                                            <td className="px-3 py-2 font-medium">D</td>
                                            <td className="px-3 py-2 text-center">8</td>
                                            <td className="px-3 py-2 text-center">0</td>
                                            <td className="px-3 py-2 text-center">4</td>
                                            <td className="px-3 py-2"><span className="text-red-600">❌ Devamsız</span></td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 font-medium">E</td>
                                            <td className="px-3 py-2 text-center">15</td>
                                            <td className="px-3 py-2 text-center">2</td>
                                            <td className="px-3 py-2 text-center">10</td>
                                            <td className="px-3 py-2"><span className="text-purple-600">🧪 Testör</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Eleme Süreci */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-md border border-blue-200 mb-6">
                            <h4 className="font-semibold text-slate-700 mb-3">🔄 Eleme Süreci:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">1</span>
                                    <span>A, B, C, D, E başlangıç (5 kişi)</span>
                                </div>
                                <div className="flex items-center gap-2 text-red-600">
                                    <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold">2</span>
                                    <span>D elendi → Devamsız ❌</span>
                                </div>
                                <div className="flex items-center gap-2 text-amber-600">
                                    <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold">3</span>
                                    <span>C bu tur atlandı → Son alan (rotasyon) ⏭️</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold">4</span>
                                    <span>Kalan: A, B, E (3 kişi) ✅</span>
                                </div>
                            </div>
                        </div>

                        {/* Sıralama */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 shadow-md border border-emerald-200 mb-6">
                            <h4 className="font-semibold text-slate-700 mb-3">📈 Sıralama (En Uygun → En Son):</h4>
                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-3 border-2 border-emerald-400 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">🏆</span>
                                            <span className="font-bold text-emerald-700">1. A</span>
                                        </div>
                                        <span className="text-sm bg-emerald-100 px-2 py-1 rounded text-emerald-700">Yıllık: 10 (en düşük)</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🥈</span>
                                            <span className="font-medium text-slate-700">2. B</span>
                                        </div>
                                        <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">Yıllık: 11</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🥉</span>
                                            <span className="font-medium text-slate-700">3. E</span>
                                        </div>
                                        <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">Yıllık: 15</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sonuç */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 shadow-lg text-white">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl">🎉</div>
                                <div>
                                    <h4 className="font-bold text-xl mb-1">Sonuç: A Kazandı!</h4>
                                    <p className="text-emerald-100 text-sm">
                                        D devamsız olduğu için elendi. C son aldığı için bu tur atlandı.
                                        Kalan 3 kişi arasında A'nın yıllık puanı en düşük (10) olduğu için dosya A'ya atandı.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Eşitlik Durumu */}
                        <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 shadow-md border border-amber-200">
                            <h4 className="font-semibold text-slate-700 mb-3">⚖️ Eşitlik Olursa Ne Olur?</h4>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-amber-600">1.</span>
                                    <span>Yıllık puan eşitse → <strong>Günlük dosya sayısına</strong> bakılır (az olan önce)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-amber-600">2.</span>
                                    <span>Günlük de eşitse → <strong>Aylık dosya sayısına</strong> bakılır (az olan önce)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-amber-600">3.</span>
                                    <span>O da eşitse → <strong>Rastgele</strong> seçilir</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
