"use client";

import React from "react";
import QRCode from "react-qr-code";
import { Printer } from "lucide-react";

export default function QrPosterPage() {
    // A4 boyutunda, ortalı tasarım
    return (
        <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8 print:p-0">

            {/* Çerçeve (Yazıcıda kenar boşluğu bırakmak için max-w ayarı) */}
            <div className="border-[8px] border-black p-12 rounded-[3rem] flex flex-col items-center text-center space-y-10 max-w-2xl w-full mx-auto print:border-[6px] print:p-8 print:rounded-[2rem]">

                {/* Üst Başlık */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-500 uppercase tracking-[0.2em]">Karşıyaka RAM</h2>
                    <h1 className="text-5xl font-black uppercase tracking-tight">Sıra Almak İçin</h1>
                </div>

                {/* QR KOD */}
                <div className="bg-white p-4 rounded-xl border-4 border-slate-200 shadow-sm print:shadow-none print:border-black">
                    <QRCode
                        value="https://ram-dosya-atama.vercel.app/sira-al"
                        size={300}
                        className="w-full h-full"
                        viewBox={`0 0 256 256`}
                    />
                </div>

                {/* Talimatlar */}
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold bg-black text-white px-6 py-2 rounded-full inline-block print:bg-black print:text-white print:px-6 print:py-2">
                        Kodu Okutunuz
                    </h2>
                    <p className="text-2xl text-slate-700 font-medium px-8 leading-relaxed">
                        Telefonunuzun kamerasını açın ve <br />yukarıdaki QR kodu okutun.
                    </p>
                </div>

                {/* Alt Bilgi */}
                <div className="pt-12 mt-auto w-full border-t-2 border-slate-100 print:border-slate-300">
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-semibold uppercase tracking-widest text-sm">
                        RAM Dijital Sıramatik Sistemi
                    </div>
                </div>

            </div>

            {/* Yazdır Butonu (Çıktıda görünmez) */}
            <button
                onClick={() => window.print()}
                className="mt-12 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 print:hidden"
            >
                <Printer className="w-6 h-6" />
                POSTERİ YAZDIR
            </button>

            <p className="mt-4 text-slate-400 text-sm print:hidden">
                * En iyi sonuç için yazdırma ayarlarından "Arka Plan Grafikleri"ni açınız.
            </p>
        </div>
    );
}
