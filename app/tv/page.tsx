"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { QueueTicket } from "@/types";
import { format } from "date-fns";

export default function TvDisplayPage() {
    const queue = useAppStore(s => s.queue);
    const { playDingDong } = useAudioFeedback();

    // Sync hook'unu aktif et (data fetch + realtime sub)
    useSupabaseSync();

    const [lastAnnouncedId, setLastAnnouncedId] = useState<string | null>(null);
    const [currentTicket, setCurrentTicket] = useState<QueueTicket | null>(null);
    const hasInteractedRef = useRef(false);

    // Son çağrılan bileti bul
    useEffect(() => {
        // En son update edilen ve called olanı bul
        const calledTickets = queue
            .filter(t => t.status === 'called')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        const latest = calledTickets[0];

        setCurrentTicket(latest || null);

        if (latest && latest.id !== lastAnnouncedId) {
            setLastAnnouncedId(latest.id);
            announceTicket(latest);
        }
    }, [queue, lastAnnouncedId]);

    const announceTicket = (ticket: QueueTicket) => {
        // 1. Ding Dong
        playDingDong();

        // 2. TTS
        if ('speechSynthesis' in window) {
            // Ding dong bitene kadar biraz bekle
            setTimeout(() => {
                const text = `Sıra numarası ${ticket.no}. ${ticket.name && ticket.name !== "Misafir" ? ticket.name + "." : ""} Lütfen içeri giriniz.`;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = "tr-TR";
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }, 1500);
        }
    };

    // Interaction handler for audio context
    const handleInteract = () => {
        if (!hasInteractedRef.current) {
            hasInteractedRef.current = true;
            playDingDong(); // Test sesi
        }
    };

    return (
        <div
            className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
            onClick={handleInteract}
        >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-slate-900 z-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            {!hasInteractedRef.current && (
                <div className="absolute top-4 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold z-50 animate-pulse">
                    Sesleri etkinleştirmek için ekrana tıklayın
                </div>
            )}

            <div className="z-10 text-center space-y-8 p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-[90%] max-w-5xl">
                <h1 className="text-4xl lg:text-5xl font-light tracking-[0.2em] text-purple-300 uppercase opacity-80">
                    Sıradaki Numara
                </h1>

                {currentTicket ? (
                    <div className="animate-in zoom-in duration-500">
                        <div className="text-[12rem] lg:text-[16rem] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-purple-200 drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]">
                            {currentTicket.no}
                        </div>
                        {currentTicket.name && (
                            <div className="text-4xl lg:text-6xl font-medium mt-8 text-white/90">
                                {currentTicket.name}
                            </div>
                        )}
                        <div className="mt-8 inline-block px-8 py-3 bg-green-500/20 text-green-300 rounded-full text-2xl font-bold border border-green-500/30 animate-pulse">
                            GÖRÜŞME ODASINA GEÇİNİZ
                        </div>
                    </div>
                ) : (
                    <div className="text-6xl font-light text-slate-500 py-20">
                        Bekleniyor...
                    </div>
                )}
            </div>

            {/* Alt Bilgi */}
            <div className="absolute bottom-8 text-slate-400 text-lg font-light tracking-widest z-10">
                RAM DİJİTAL ASİSTAN | {format(new Date(), "HH:mm")}
            </div>

            {/* Son Çağrılanlar Listesi (Opsiyonel - Sağda küçük) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block w-64 z-10">
                <h3 className="text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm border-b border-slate-700 pb-2">Geçmiş Çağrılar</h3>
                <div className="space-y-3">
                    {queue
                        .filter(t => t.status === 'called' && (!currentTicket || t.id !== currentTicket.id))
                        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                        .slice(0, 5)
                        .map(t => (
                            <div key={t.id} className="bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center opacity-70">
                                <span className="font-bold text-2xl">{t.no}</span>
                                <span className="text-sm truncate max-w-[100px]">{t.name}</span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
