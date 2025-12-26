"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Ticket } from "lucide-react";
import { QueueTicket } from "@/types";

export default function SiraAlPage() {
    const { queue, setQueue } = useAppStore();
    const { fetchCentralState } = useSupabaseSync();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [printTicket, setPrintTicket] = useState<QueueTicket | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        fetchCentralState();
        const interval = setInterval(fetchCentralState, 10000);
        return () => clearInterval(interval);
    }, [fetchCentralState]);

    // Auto-print and reset when ticket is created
    useEffect(() => {
        if (printTicket) {
            // Trigger print
            setTimeout(() => {
                window.print();

                // Reset form after printing
                setTimeout(() => {
                    setPrintTicket(null);
                    setName("");
                }, 2000);
            }, 500);
        }
    }, [printTicket]);

    const handleSiraAl = async () => {
        setLoading(true);
        const nameInput = name.trim() || "Misafir";

        try {
            const res = await fetch("/api/queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add", name: nameInput })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Sıra alınamadı");
            }

            const data = await res.json();
            if (data.ok && data.ticket) {
                const newTicket = data.ticket as QueueTicket;
                setQueue([...queue, newTicket]);
                setPrintTicket(newTicket);
                setLoading(false); // Reset loading after successful ticket creation

                setTimeout(() => {
                    fetchCentralState();
                }, 500);
            } else {
                throw new Error(data.error || "Sıra alınamadı");
            }
        } catch (err: any) {
            console.error("Queue error:", err);
            const errorMessage = err?.message || "Sıra alınırken bir hata oluştu.";
            alert(errorMessage);
            setLoading(false);
        }
    };

    const totalWaiting = queue.filter(t => t.status === 'waiting').length;

    return (
        <>
            {/* MAIN KIOSK SCREEN */}
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center p-8 print:hidden">
                <div className="w-full max-w-2xl space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl">
                            <Ticket className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tight">Dijital Sıramatik</h1>
                            <p className="text-xl text-white/80 font-medium mt-2">Karşıyaka RAM Özel Eğitim Bölümü</p>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-8">
                        {printTicket ? (
                            /* YAZDIRILIYOR */
                            <div className="text-center space-y-6 py-12">
                                <Printer className="w-20 h-20 mx-auto text-purple-600 animate-pulse" />
                                <div>
                                    <h2 className="text-4xl font-black text-slate-800 mb-2">Yazdırılıyor...</h2>
                                    <p className="text-2xl text-slate-500">Sıra numaranızı alın</p>
                                </div>
                                <div className="text-8xl font-black text-purple-600">
                                    {printTicket.no}
                                </div>
                            </div>
                        ) : (
                            /* SIRA ALMA FORMU */
                            <>
                                {/* İsim Input */}
                                <div className="space-y-3">
                                    <label className="text-2xl font-bold text-slate-700 block">
                                        İsim Soyisim <span className="text-slate-400 font-normal">(İsteğe Bağlı)</span>
                                    </label>
                                    <Input
                                        placeholder="Adınızı girebilirsiniz..."
                                        className="h-20 text-2xl rounded-2xl border-2 border-slate-200 focus:border-purple-500 bg-slate-50 px-6"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                {/* Kocaman Sıra Al Butonu */}
                                <Button
                                    className="w-full h-32 text-4xl font-black rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleSiraAl}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-12 h-12 animate-spin" />
                                    ) : (
                                        <>
                                            <Ticket className="w-12 h-12 mr-4" />
                                            SIRA AL
                                        </>
                                    )}
                                </Button>

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse"></div>
                                        <span className="text-xl text-slate-600 font-medium">Sistem Aktif</span>
                                    </div>
                                    <div className="text-xl text-slate-600">
                                        <span className="font-bold text-purple-600">{totalWaiting}</span> kişi bekliyor
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-white/60 text-lg font-medium">
                        RAM Dijital Sistemleri © 2025
                    </div>
                </div>
            </div>

            {/* PRINT RECEIPT */}
            {printTicket && (
                <div ref={printRef} className="hidden print:block print:p-8">
                    <div className="text-center space-y-6 max-w-sm mx-auto">
                        {/* Logo */}
                        <div className="border-b-4 border-dashed border-slate-300 pb-6">
                            <h1 className="text-3xl font-black text-slate-900">RAM</h1>
                            <p className="text-sm text-slate-600 mt-1">Karşıyaka RAM Özel Eğitim Bölümü</p>
                        </div>

                        {/* Ticket Number */}
                        <div className="py-8">
                            <p className="text-lg font-bold text-slate-600 uppercase tracking-wider mb-3">
                                Sıra Numaranız
                            </p>
                            <div className="text-9xl font-black text-slate-900 leading-none">
                                {printTicket.no}
                            </div>
                        </div>

                        {/* Name */}
                        {printTicket.name && printTicket.name !== "Misafir" && (
                            <div className="border-t border-dashed border-slate-300 pt-4">
                                <p className="text-sm text-slate-500 uppercase tracking-wider mb-1">İsim</p>
                                <p className="text-xl font-bold text-slate-800">{printTicket.name}</p>
                            </div>
                        )}

                        {/* Timestamp */}
                        <div className="border-t border-dashed border-slate-300 pt-4 text-sm text-slate-500">
                            {new Date(printTicket.createdAt).toLocaleString('tr-TR')}
                        </div>

                        {/* Footer */}
                        <div className="border-t-4 border-dashed border-slate-300 pt-6 text-xs text-slate-400">
                            <p>Lütfen sıranızı bekleyiniz</p>
                            <p className="mt-1">Ekranda numaranız göründüğünde içeri giriniz</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
