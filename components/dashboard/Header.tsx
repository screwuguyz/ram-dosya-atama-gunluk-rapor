
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX } from "lucide-react";
import QuickSearch from "@/components/search/QuickSearch";
import type { Teacher, CaseFile } from "@/types";

// Toast helper - using the app store's toast action would be ideal, 
// but for a dumb component, we might need a prop or a simple workaround.
// Based on page.tsx, toast is passed from useAppStore.
// Let's modify props to accept toast or remove the direct import.


interface HeaderProps {
    viewMode: "landing" | "main" | "teacher-tracking" | "archive";
    setViewMode: (mode: "landing" | "main" | "teacher-tracking" | "archive") => void;
    isAdmin: boolean;
    filterYM: string;
    setFilterYM: (ym: string) => void;
    allMonths: string[];
    teachers: Teacher[];
    cases: CaseFile[];
    history: Record<string, CaseFile[]>;
    live: "online" | "connecting" | "offline";
    doLogout: () => void;
    setLoginOpen: (open: boolean) => void;
    setShowRules: (show: boolean) => void;
    setFeedbackOpen: (open: boolean) => void;
    soundOn: boolean;
    setSoundOn: (on: boolean) => void;
    setSettingsOpen: (open: boolean) => void;
    doRollover: () => void; // For simulation mode
    toast: (msg: string) => void;
}

export default function Header({
    viewMode,
    setViewMode,
    isAdmin,
    filterYM,
    setFilterYM,
    allMonths,
    teachers,
    cases,
    history,
    live,
    doLogout,
    setLoginOpen,
    setShowRules,
    setFeedbackOpen,
    soundOn,
    setSoundOn,
    setSettingsOpen,
    doRollover,
    toast
}: HeaderProps) {
    // Simülasyon modu kontrolü (SSR safe)
    const [simDate, setSimDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            setSimDate(new URLSearchParams(window.location.search).get("simDate"));
        }
    }, []);

    return (
        <div className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200/60">
            <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">

                {/* Satır 1: Ana kontroller */}
                <div className="flex items-center justify-between gap-2">
                    {/* Sol: Ana sayfa + Ay + Arama */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button size="sm" variant="outline" className="px-2 sm:px-3 text-xs sm:text-sm" onClick={() => setViewMode("landing")}>
                            🏠 <span className="hidden sm:inline">Ana Sayfa</span>
                        </Button>
                        {isAdmin && (
                            <Select value={filterYM} onValueChange={setFilterYM}>
                                <SelectTrigger className="w-[90px] sm:w-[130px] text-xs sm:text-sm">
                                    <SelectValue placeholder="Ay" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allMonths.map((m) => (
                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {/* Hızlı Arama Butonu */}
                        <QuickSearch
                            teachers={teachers}
                            cases={cases}
                            history={history}
                            onSelectTeacher={(id) => {
                                const teacher = teachers.find(t => t.id === id);
                                if (teacher) toast(`${teacher.name} seçildi`);
                            }}
                            onSelectCase={(caseFile) => {
                                toast(`${caseFile.student} - ${caseFile.createdAt.split("T")[0]}`);
                            }}
                        />
                    </div>

                    {/* Sağ: Canlı rozet + Admin/Giriş */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* CANLI ROZET - Kısa versiyon mobilde */}
                        <span
                            className={
                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ring-1 " +
                                (live === "online"
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                    : live === "connecting"
                                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                                        : "bg-rose-50 text-rose-700 ring-rose-200")
                            }
                            title={live === "online" ? "Bağlı" : live === "connecting" ? "Bağlanıyor" : "Bağlı değil"}
                        >
                            <span className="inline-block size-1.5 rounded-full bg-current animate-pulse" />
                            <span className="hidden sm:inline">🔴 Canlı:</span> {live}
                        </span>

                        {isAdmin ? (
                            <>
                                <span className="hidden sm:inline text-xs sm:text-sm text-emerald-700 font-medium">👑 Admin</span>
                                {/* Çıkış Butonu - HER ZAMAN GÖRÜNÜR */}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="px-2 sm:px-3 text-xs sm:text-sm"
                                    onClick={doLogout}
                                >
                                    🚪 <span className="hidden sm:inline">Çıkış</span>
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" className="px-2 sm:px-3 text-xs sm:text-sm" onClick={() => setLoginOpen(true)}>
                                🔐 <span className="hidden sm:inline">Giriş</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Satır 2: Ek butonlar (mobilde kaydırılabilir) */}
                <div className="flex items-center gap-1 sm:gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                    <Button size="sm" variant="outline" className="shrink-0 px-2 sm:px-3 text-xs sm:text-sm" onClick={() => setShowRules(true)}>
                        📖 <span className="hidden sm:inline">Kurallar</span>
                    </Button>
                    <Button size="sm" variant="outline" className="shrink-0 px-2 sm:px-3 text-xs sm:text-sm" onClick={() => setFeedbackOpen(true)}>
                        💬 <span className="hidden xs:inline">Öneri</span><span className="hidden sm:inline">/Şikayet</span>
                    </Button>

                    {isAdmin && (
                        <>
                            {/* Ses Aç/Kapat */}
                            <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0 px-2"
                                data-silent="true"
                                title={soundOn ? "Sesi Kapat" : "Sesi Aç"}
                                onClick={() => setSoundOn(!soundOn)}
                            >
                                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                            </Button>

                            {/* Ayarlar */}
                            <Button size="sm" variant="outline" className="shrink-0 px-2 sm:px-3 text-xs sm:text-sm" onClick={() => setSettingsOpen(true)}>
                                ⚙️ <span className="hidden sm:inline">Ayarlar</span>
                            </Button>

                            {/* Simülasyon Modu */}
                            {simDate && (
                                <>
                                    <span className="shrink-0 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                                        📅 {simDate}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="shrink-0 px-2 sm:px-3 text-xs"
                                        onClick={() => {
                                            if (confirm("Günü bitir ve arşivle? (Devamsızlık cezası + Yedek bonusu uygulanacak)")) {
                                                doRollover();
                                                toast("Gün bitirildi! Devamsızlık/yedek puanları uygulandı.");
                                            }
                                        }}
                                    >
                                        🌙 <span className="hidden sm:inline">Günü Bitir</span>
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
