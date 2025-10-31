"use client";
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CaseFile } from "@/lib/types";

function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AssignedArchive({
  history,
  cases,
  teacherName,
  caseDesc,
}: {
  history: Record<string, CaseFile[]>;
  cases: CaseFile[];
  teacherName: (id?: string) => string;
  caseDesc: (c: CaseFile) => string;
}) {
  const days = useMemo(() => {
    const set = new Set<string>(Object.keys(history));
    const todayYmd = ymdLocal(new Date());
    if (cases.some((c) => c.createdAt.slice(0, 10) === todayYmd)) set.add(todayYmd);
    return Array.from(set).sort();
  }, [history, cases]);

  if (days.length === 0) {
    return (
      <Card className="mt-4"><CardHeader><CardTitle>Atanan Dosyalar</CardTitle></CardHeader>
        <CardContent>Henüz arşiv kaydı yok.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>Atanan Dosyalar (Günlük Arşiv)</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {days.map((d) => {
          const list = [
            ...(history[d] || []),
            ...cases.filter((c) => c.createdAt.slice(0, 10) === d),
          ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

          return (
            <div key={d} className="border rounded-lg">
              <div className="px-3 py-2 bg-muted font-medium">{d}</div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left">Öğrenci</th>
                      <th className="p-2 text-right">Puan</th>
                      <th className="p-2 text-left">Saat</th>
                      <th className="p-2 text-left">Atanan</th>
                      <th className="p-2 text-left">Test</th>
                      <th className="p-2 text-left">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => (
                      <tr key={c.id} className="border-t">
                        <td className="p-2">{c.fileNo ? `${c.fileNo} - ${c.student}` : c.student}</td>
                        <td className="p-2 text-right">{c.score}</td>
                        <td className="p-2">
                          {new Date(c.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-2">{teacherName(c.assignedTo)}</td>
                        <td className="p-2">{c.isTest ? "Evet (+7)" : "Hayır"}</td>
                        <td className="p-2 text-sm text-muted-foreground">{caseDesc(c)}</td>
                      </tr>
                    ))}
                    {list.length === 0 && (
                      <tr><td className="p-4 text-center text-muted-foreground" colSpan={6}>Bu günde kayıt yok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
