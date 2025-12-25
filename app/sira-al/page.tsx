"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Ticket, Users, Clock, CheckCircle } from "lucide-react";

export default function QueueVisitorPage() {
    const addQueueTicket = useAppStore(s => s.addQueueTicket);
    const queue = useAppStore(s => s.queue);

    const [myTicketId, setMyTicketId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTakeTicket = () => {
        if (loading) return;
        setLoading(true);

        // Biraz bekle (tıklama feedback'i için)
        setTimeout(() => {
            // Bileti ekle
            addQueueTicket(name || "Misafir");

            // Store'un güncel halinden son bileti ID'sini bul
            // useAppStore.getState() hook içinde kullanılamaz ama import edip kullanabiliriz.
            // Ancak burada re-render beklemeden anlık state'e erişmek için useAppStore.getState() kullanmak en temizi.
            // Fakat Client Component olduğu için import edilen useAppStore üzerinden getState çağrılabilir.
            const currentQueue = useAppStore.getState().queue;
            const lastTicket = currentQueue[currentQueue.length - 1];

            if (lastTicket) {
                setMyTicketId(lastTicket.id);
            }

            setLoading(false);
        }, 600);
    };

    // Benim biletimi bul
    const myTicket = queue.find(t => t.id === myTicketId);

    // Önümde kaç kişi var? (Durumu 'waiting' olan ve numarası benden küçük olanlar)
    const peopleAhead = myTicket
        ? queue.filter(t => t.status === 'waiting' && t.no < myTicket.no).length
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Ticket className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Dijital Sıramatik</CardTitle>
                    <CardDescription>Karşıyaka RAM Özel Eğitim Bölümü</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {!myTicket ? (
                        /* --- SIRA ALMA FORMU --- */
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600">Adınız Soyadınız (Opsiyonel)</label>
                                <Input
                                    placeholder="Örn: Ali Yılmaz"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-slate-50 border-slate-200 h-12 text-lg"
                                />
                            </div>

                            <Button
                                className="w-full h-14 text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg transform transition-all active:scale-95"
                                onClick={handleTakeTicket}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Alınıyor...
                                    </span>
                                ) : (
                                    "SIRA AL"
                                )}
                            </Button>

                            <p className="text-xs text-center text-slate-400 mt-4">
                                * Sıra numaranız ekranda göründüğünde görüşme odasına geçebilirsiniz.
                            </p>
                        </div>
                    ) : (
                        /* --- BİLETİM --- */
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="bg-purple-50 rounded-2xl p-6 border-2 border-dashed border-purple-200">
                                <p className="text-sm text-purple-600 font-medium mb-1 uppercase tracking-wider">Sıra Numaranız</p>
                                <div className="text-6xl font-black text-slate-900 tracking-tighter">
                                    {myTicket.no}
                                </div>
                                {myTicket.name && (
                                    <p className="text-slate-500 mt-2 font-medium">{myTicket.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
                                        <Users className="w-3 h-3" /> Önünüzde
                                    </div>
                                    <div className="text-xl font-bold text-slate-800">
                                        {peopleAhead} Kişi
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
                                        <Clock className="w-3 h-3" /> Durum
                                    </div>
                                    <div className={`text-xl font-bold ${myTicket.status === 'called' ? 'text-green-600 animate-pulse' : 'text-amber-600'
                                        }`}>
                                        {myTicket.status === 'waiting' ? 'Bekliyor' :
                                            myTicket.status === 'called' ? 'ÇAĞRILDI' : 'Tamamlandı'}
                                    </div>
                                </div>
                            </div>

                            {myTicket.status === 'called' && (
                                <div className="bg-green-100 text-green-800 p-4 rounded-xl font-bold animate-bounce">
                                    🎉 Lütfen odaya giriniz!
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="text-slate-400 hover:text-red-500 text-xs"
                                onClick={() => setMyTicketId(null)}
                            >
                                Yeni Sıra Al
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center border-t bg-slate-50/50 py-3">
                    <p className="text-xs text-slate-400">RAM Dijital Sistemleri © 2025</p>
                </CardFooter>
            </Card>
        </div>
    );
}
