import React, { useMemo, useState, useEffect } from "react";
import StatCard from "./StatCard";
import { CaseFile, Teacher, Announcement } from "@/types";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale/tr";
import {
    FilePlus,
    Users,
    Activity,
    Clock,
    Megaphone,
    CalendarDays,
    FileText,
    TrendingUp,
    Award,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayYmd } from "@/lib/date";

interface TeacherDashboardProps {
    cases: CaseFile[];
    teachers: Teacher[];
    history: Record<string, CaseFile[]>;
    announcements: Announcement[];
}

export default function TeacherDashboard({
    cases,
    teachers,
    history,
    announcements
}: TeacherDashboardProps) {
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Günaydın");
        else if (hour >= 12 && hour < 18) setGreeting("İyi Günler");
        else if (hour >= 18 && hour < 22) setGreeting("İyi Akşamlar");
        else setGreeting("İyi Geceler");
    }, []);

    const todayYmd = getTodayYmd();

    // --- Today's Stats ---
    const todayCasesCount = useMemo(() => {
        return cases.filter(c => c.createdAt.startsWith(todayYmd)).length;
    }, [cases, todayYmd]);

    const activeTeachersCount = useMemo(() => {
        return teachers.filter(t => t.active && !t.isAbsent).length;
    }, [teachers]);

    const absentTeachersCount = useMemo(() => {
        return teachers.filter(t => t.isAbsent).length;
    }, [teachers]);

    const lastCase = useMemo(() => {
        const allCases = [...cases].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return allCases.length > 0 ? allCases[0] : null;
    }, [cases]);

    // Today's Announcements
    const todayAnnouncements = useMemo(() => {
        return announcements.filter(a => a.createdAt.startsWith(todayYmd));
    }, [announcements, todayYmd]);

    // Recent activities (last 5 assignments)
    const recentAssignments = useMemo(() => {
        return [...cases]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 5)
            .map(c => ({
                id: c.id,
                student: c.student,
                teacher: teachers.find(t => t.id === c.assignedTo)?.name || "Bekliyor",
                time: c.createdAt,
            }));
    }, [cases, teachers]);

    // Top teachers today (by case count)
    const topTeachersToday = useMemo(() => {
        const counts: Record<string, number> = {};
        cases.filter(c => c.createdAt.startsWith(todayYmd) && c.assignedTo).forEach(c => {
            counts[c.assignedTo!] = (counts[c.assignedTo!] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id, count]) => ({
                name: teachers.find(t => t.id === id)?.name || "Bilinmiyor",
                count
            }));
    }, [cases, teachers, todayYmd]);

    return (
        <div className="space-y-8 animate-fade-in-up p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                        {greeting} 👋
                    </h1>
                    <p className="text-slate-500 mt-1">Bugünkü RAM durumu hakkında bilgi edinin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                    </span>
                </div>
            </div>

            {/* Today's Announcements Banner */}
            {todayAnnouncements.length > 0 && (
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-start gap-3">
                        <Megaphone className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold mb-2">📢 Bugünkü Duyurular</h3>
                            <ul className="space-y-1 text-sm">
                                {todayAnnouncements.map(a => (
                                    <li key={a.id} className="flex items-start gap-2">
                                        <span className="text-amber-200">•</span>
                                        <span>{a.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Bugün Atanan Dosya"
                    value={todayCasesCount}
                    icon={<FilePlus className="w-6 h-6" />}
                    description="Toplam atama sayısı"
                    colorTheme="blue"
                />
                <StatCard
                    title="Aktif Öğretmen"
                    value={activeTeachersCount}
                    icon={<Users className="w-6 h-6" />}
                    description={`${absentTeachersCount} kişi devamsız`}
                    colorTheme="green"
                />
                <StatCard
                    title="Son Atama"
                    value={lastCase ? format(parseISO(lastCase.createdAt), "HH:mm") : "--:--"}
                    icon={<Clock className="w-6 h-6" />}
                    description={lastCase ? lastCase.student : "Henüz atama yok"}
                    colorTheme="purple"
                />
                <StatCard
                    title="Duyuru Sayısı"
                    value={todayAnnouncements.length}
                    icon={<Megaphone className="w-6 h-6" />}
                    description="Bugünkü duyurular"
                    colorTheme="orange"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Assignments */}
                <Card className="border shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Son Atamalar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {recentAssignments.map(item => (
                                <div key={item.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{item.student}</p>
                                        <p className="text-xs text-slate-500">→ {item.teacher}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {format(parseISO(item.time), "HH:mm")}
                                    </span>
                                </div>
                            ))}
                            {recentAssignments.length === 0 && (
                                <div className="py-6 text-center text-slate-400 text-sm">
                                    Henüz atama yapılmadı.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Teachers Today */}
                <Card className="border shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            Bugünün Yıldızları
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topTeachersToday.map((teacher, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${idx === 0 ? "bg-amber-500" :
                                            idx === 1 ? "bg-slate-400" :
                                                "bg-orange-400"
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-800">{teacher.name}</p>
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">{teacher.count} dosya</span>
                                </div>
                            ))}
                            {topTeachersToday.length === 0 && (
                                <div className="py-6 text-center text-slate-400 text-sm">
                                    Henüz atama yapılmadı.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Footer */}
            <div className="text-center text-xs text-slate-400 pt-4">
                Bu ekran bilgilendirme amaçlıdır. İşlem yapmak için yönetici girişi yapmanız gerekmektedir.
            </div>
        </div>
    );
}
