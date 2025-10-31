"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CaseFile, Teacher } from "@/app/page";
import { Input } from "@/components/ui/input";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // e.g. https://ram-dosya-atama.vercel.app
const USE_PROXY = !!API_BASE; // localde doluysa proxy, Vercel'de boş bırak

function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AssignedArchiveSingleDay({
  history,
  cases,
  teacherName,
  caseDesc,
  teachers,
}: {
  history: Record<string, CaseFile[]>;
  cases: CaseFile[];
  teacherName: (id?: string) => string;
  caseDesc: (c: CaseFile) => string;
  teachers: Teacher[];
}) {
  const days = React.useMemo(() => {
    const set = new Set<string>(Object.keys(history));
    const todayYmd = ymdLocal(new Date());
    // Bugün hiç kayıt olmasa bile 'bugün' seçilebilir olsun
    set.add(todayYmd);
    return Array.from(set).sort();
  }, [history, cases]);

  const [day, setDay] = React.useState<string>(() => {
    const today = ymdLocal(new Date());
    if (days.length === 0) return today;
    return days.includes(today) ? today : days[days.length - 1];
  });

  React.useEffect(() => {
    if (days.length === 0) return;
    if (!days.includes(day)) setDay(days[days.length - 1]);
  }, [days, day]);

  const list = React.useMemo(() => {
    return [
      ...(history[day] || []),
      ...cases.filter((c) => c.createdAt.slice(0, 10) === day),
    ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [day, history, cases]);

  const idx = days.indexOf(day);
  const prevDisabled = idx <= 0;
  const nextDisabled = idx === -1 || idx >= days.length - 1;
  const [aiOpenId, setAiOpenId] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiMessages, setAiMessages] = React.useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [aiInput, setAiInput] = React.useState("");

  // Seçili gün için öğretmen özetlerini hazırla (günlük sayaç ve test almış mı)
  const teacherSummaries = React.useMemo(() => {
    const dayCases = cases.filter((c) => c.createdAt.slice(0, 10) === day);
    const countMap = new Map<string, number>();
    const hasTestMap = new Map<string, boolean>();
    for (const c of dayCases) {
      if (!c.assignedTo) continue;
      countMap.set(c.assignedTo, (countMap.get(c.assignedTo) || 0) + 1);
      if (c.isTest) hasTestMap.set(c.assignedTo, true);
    }
    return teachers.map((t) => ({
      id: t.id,
      name: t.name,
      isTester: !!t.isTester,
      isAbsent: !!t.isAbsent,
      active: !!t.active,
      yearlyLoad: Number(t.yearlyLoad || 0),
      todayCount: countMap.get(t.id) || 0,
      hasTestToday: !!hasTestMap.get(t.id),
    }));
  }, [teachers, cases, day]);

  return (
    <Card className="mt-4">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Atanan Dosyalar (Tek Gün)</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={prevDisabled} onClick={() => !prevDisabled && setDay(days[idx - 1])}>
            Önceki
          </Button>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Gün seç" /></SelectTrigger>
            <SelectContent>
              {days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" disabled={nextDisabled} onClick={() => !nextDisabled && setDay(days[idx + 1])}>
            Sonraki
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm border border-border">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="p-2 text-left">Öğrenci</th>
                <th className="p-2 text-right">Puan</th>
                <th className="p-2 text-left">Saat</th>
                <th className="p-2 text-left">Atanan</th>
                <th className="p-2 text-left">Test</th>
                <th className="p-2 text-left">Açıklama</th>
                <th className="p-2 text-left">Yapay Zeka</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className="border-t odd:bg-muted/30">
                    <td className="p-2">{c.student}</td>
                    <td className="p-2 text-right">{c.score}</td>
                    <td className="p-2">
                      {new Date(c.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-2">{teacherName(c.assignedTo)}</td>
                    <td className="p-2">{c.isTest ? "Evet (+7)" : "Hayır"}</td>
                    <td className="p-2 text-sm text-muted-foreground">{caseDesc(c)}</td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setAiOpenId(prev => {
                            const next = prev === c.id ? null : c.id;
                            if (next === c.id) {
                              // Yeni bir satır için panel açılıyorsa sohbeti baştan başlat
                              setAiMessages([]);
                              setAiInput('Neden bu dosyayı buraya atadın?');
                            }
                            return next;
                          });
                        }}
                      >
                        YAPAY ZEKA İLE AÇIKLA
                      </Button>
                    </td>
                  </tr>
                  {aiOpenId === c.id && (
                    <tr className="border-t bg-white">
                      <td className="p-3" colSpan={7}>
                          <div className="border rounded-md p-3 space-y-3">
                            <div className="font-medium">Yapay Zeka Açıklaması — Atanan: {teacherName(c.assignedTo) || '—'}</div>
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {aiMessages.map((m, idx) => (
                              <div key={idx} className={m.role === 'user' ? 'text-slate-800' : 'text-emerald-800'}>
                                <span className="text-xs uppercase font-semibold mr-2">{m.role === 'user' ? 'Siz' : 'Asistan'}</span>
                                <span>{m.content}</span>
                              </div>
                            ))}
                          </div>
                          <form
                            className="flex gap-2"
                            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                              e.preventDefault();
                              const q = aiInput.trim() || 'Neden bu dosyayı buraya atadın?';
                              setAiInput('');
                              setAiLoading(true);
                              try {
                                const rules = [
                                  'ÖNCE TEST DOSYALARI YALNIZCA TESTÖR ÖĞRETMENLERE ATANIR.',
                                  'UYGUNLUK: AKTİF, DEVAMSIZ DEĞİL, BUGÜN TEST ALMAMIŞ, GÜNLÜK SINIRI AŞMAMIŞ.',
                                  'SIRALAMA: ÖNCE YILLIK YÜK AZ → DAHA SONRA BUGÜN ALINAN DOSYA SAYISI AZ → RASTGELE.',
                                  'ARDIŞIK AYNI ÖĞRETMENE ATAMA YAPILMAMASI TERCİH EDİLİR.',
                                  'GÜNLÜK ÜST SINIR: ÖĞRETMEN BAŞINA EN FAZLA 4 DOSYA.',
                                  'PUANLAMA: TEST=7; YÖNLENDİRME=1; DESTEK=2; İKİSİ=3; YENİ=+1; TANI=0–6 (üst sınır 6).',
                                ];
                                const endpoint = USE_PROXY ? '/api/explain-proxy' : '/api/explain';
                                const res = await fetch(endpoint, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    question: q,
                                    caseFile: {
                                      id: c.id,
                                      student: c.student,
                                      fileNo: c.fileNo,
                                      score: c.score,
                                      type: c.type,
                                      isNew: c.isNew,
                                      diagCount: c.diagCount,
                                      isTest: c.isTest,
                                      assignedTo: c.assignedTo,
                                      assignReason: c.assignReason,
                                      createdAt: c.createdAt,
                                    },
                                    selectedTeacher: { id: c.assignedTo, name: teacherName(c.assignedTo) },
                                    rules,
                                    context: { today: day, dailyLimit: 4 },
                                    otherTeachers: teacherSummaries,
                                    messages: aiMessages,
                                  }),
                                });
                                let text = '';
                                try { text = await res.text(); } catch {}
                                let answer = '';
                                let details = '';
                                if (text) {
                                  try {
                                    const json = JSON.parse(text);
                                    answer = json?.answer || json?.error || text;
                                    details = json?.details ? `\nDetay: ${String(json.details)}` : '';
                                  } catch {
                                    answer = text;
                                  }
                                }
                                if (!res.ok) {
                                  setAiMessages((msgs) => [
                                    ...msgs,
                                    { role: 'assistant', content: `Hata: ${answer || 'Bilinmeyen hata'}${details}` },
                                  ]);
                                } else {
                                  setAiMessages((msgs) => [
                                    ...msgs,
                                    { role: 'assistant', content: String(answer || '(Yanıt alınamadı)') },
                                  ]);
                                }
                              } catch (err: any) {
                                const msg = err?.message || String(err) || 'Bir hata oluştu.';
                                setAiMessages((msgs) => [
                                  ...msgs,
                                  { role: 'assistant', content: `Hata: ${msg}` },
                                ]);
                              } finally {
                                setAiLoading(false);
                              }
                            }}
                          >
                            <Input
                              value={aiInput}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiInput(e.target.value)}
                              onFocus={() => { if (!aiInput) setAiInput('Neden bu dosyayı buraya atadın?'); }}
                              placeholder="Sorunuzu yazın..."
                              className="flex-1"
                            />
                            <Button type="submit" disabled={aiLoading}>{aiLoading ? 'Gönderiliyor...' : 'Yapay Zekaya Sor'}</Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {list.length === 0 && (
                <tr><td className="p-4 text-center text-muted-foreground" colSpan={7}>Bu günde kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
