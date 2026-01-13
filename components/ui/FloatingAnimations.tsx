"use client";

import React from 'react';
import { motion } from "framer-motion"; // Animasyon için

// Eğer framer-motion yoksa basit CSS ile de yapabiliriz ama muhtemelen vardır. 
// Yoksa CSS fallback kullanacağız.

export function SchoolParade() {
    return (
        <div className="fixed bottom-0 left-0 w-full overflow-hidden pointer-events-none z-0 opacity-80 h-24">
            {/* Kayan Şerit Animasyonu */}
            <div className="absolute bottom-0 animate-marquee whitespace-nowrap flex items-end pb-2">
                {/* Grup 1 */}
                <div className="flex items-end gap-12 mx-8 text-6xl">
                    <span className="transform -scale-x-100 filter drop-shadow-lg">🚌</span> {/* Otobüs */}
                    <span className="animate-bounce-slight filter drop-shadow-md delay-100 text-5xl">🏃‍♂️</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-200 text-5xl">🎒</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-300 text-5xl">🚶‍♀️</span>
                    <span className="transform -scale-x-100 filter drop-shadow-lg text-6xl">🛹</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-500 text-5xl">🏃‍♀️</span>
                </div>

                {/* Grup 2 (Tekrar) */}
                <div className="flex items-end gap-12 mx-8 text-6xl">
                    <span className="transform -scale-x-100 filter drop-shadow-lg">🚌</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-100 text-5xl">🏃‍♂️</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-200 text-5xl">🎒</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-300 text-5xl">🚶‍♀️</span>
                    <span className="transform -scale-x-100 filter drop-shadow-lg text-6xl">🛹</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-500 text-5xl">🏃‍♀️</span>
                </div>

                {/* Grup 3 (Süreklilik için) */}
                <div className="flex items-end gap-12 mx-8 text-6xl">
                    <span className="transform -scale-x-100 filter drop-shadow-lg">🚌</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-100 text-5xl">🏃‍♂️</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-200 text-5xl">🎒</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-300 text-5xl">🚶‍♀️</span>
                    <span className="transform -scale-x-100 filter drop-shadow-lg text-6xl">🛹</span>
                    <span className="animate-bounce-slight filter drop-shadow-md delay-500 text-5xl">🏃‍♀️</span>
                </div>
            </div>
        </div>
    );
}

export function FloatingIcons() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            {/* Sol Üst - Kitap */}
            <div className="absolute top-20 left-20 text-6xl opacity-10 animate-float-slow">
                📚
            </div>

            {/* Sağ Üst - Zil */}
            <div className="absolute top-40 right-40 text-5xl opacity-10 animate-float-reverse">
                🔔
            </div>

            {/* Sol Alt - Kalem */}
            <div className="absolute bottom-40 left-60 text-5xl opacity-10 animate-pulse-slow">
                ✏️
            </div>

            {/* Sağ Alt - Mezuniyet - Eğer sayfa uzunsa aşağıda kalır */}
            <div className="absolute top-1/2 right-20 text-6xl opacity-5 animate-spin-slow">
                🎓
            </div>

            {/* Orta - Dünya */}
            <div className="absolute top-1/4 left-1/3 text-4xl opacity-5 animate-float-slow delay-700">
                🌍
            </div>
        </div>
    );
}

export function WelcomeLottie() {
    // Burada JSON data kullanılabilir ama şimdilik placeholder olarak CSS animasyonlu bir yapı kuruyoruz.
    // Gerçek Lottie için JSON dosyasını public klasörüne koymak gerekir.
    // Şimdilik çok şık bir CSS "Hoşgeldiniz" animasyonu yapalım.
    return (
        <div className="flex justify-center mb-6">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <div className="text-6xl animate-bounce-in">
                    🏫
                </div>
            </div>
        </div>
    );
}
