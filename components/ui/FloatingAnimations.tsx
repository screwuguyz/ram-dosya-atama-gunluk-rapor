"use client";

import React from 'react';
import { motion } from "framer-motion";

export function SchoolParade() {
    return (
        <div className="fixed bottom-0 left-0 w-full overflow-hidden pointer-events-none z-10 opacity-100 h-40">
            {/* Kayan Şerit Animasyonu - Zemin Çizgisi */}
            <div className="absolute bottom-4 w-full h-[3px] bg-gradient-to-r from-teal-400 via-indigo-400 to-orange-400 opacity-70"></div>

            <div className="absolute bottom-6 animate-marquee whitespace-nowrap flex items-end pb-2">
                {/* Grup 1 */}
                <div className="flex items-end gap-24 mx-12 text-8xl filter drop-shadow-2xl">
                    <span className="transform -scale-x-100 hover:scale-110 transition-transform cursor-pointer hover:rotate-3">🚌</span>
                    <span className="animate-bounce-slight delay-100 text-7xl hover:animate-spin">🏃‍♂️</span>
                    <span className="animate-bounce-slight delay-200 text-7xl">🎒</span>
                    <span className="animate-bounce-slight delay-300 text-7xl hover:skew-y-12">🚶‍♀️</span>
                    <span className="transform -scale-x-100 text-8xl hover:translate-x-4 transition-transform">🛹</span>
                    <span className="animate-bounce-slight delay-500 text-7xl hover:scale-125 transition-transform">🏃‍♀️</span>
                </div>

                {/* Grup 2 (Tekrar) */}
                <div className="flex items-end gap-24 mx-12 text-8xl filter drop-shadow-2xl">
                    <span className="transform -scale-x-100">🚌</span>
                    <span className="animate-bounce-slight delay-100 text-7xl">🏃‍♂️</span>
                    <span className="animate-bounce-slight delay-200 text-7xl">🎒</span>
                    <span className="animate-bounce-slight delay-300 text-7xl">🚶‍♀️</span>
                    <span className="transform -scale-x-100 text-8xl">🛹</span>
                    <span className="animate-bounce-slight delay-500 text-7xl">🏃‍♀️</span>
                </div>

                {/* Grup 3 (Süreklilik için) */}
                <div className="flex items-end gap-24 mx-12 text-8xl filter drop-shadow-2xl">
                    <span className="transform -scale-x-100">🚌</span>
                    <span className="animate-bounce-slight delay-100 text-7xl">🏃‍♂️</span>
                    <span className="animate-bounce-slight delay-200 text-7xl">🎒</span>
                    <span className="animate-bounce-slight delay-300 text-7xl">🚶‍♀️</span>
                    <span className="transform -scale-x-100 text-8xl">🛹</span>
                    <span className="animate-bounce-slight delay-500 text-7xl">🏃‍♀️</span>
                </div>
            </div>
        </div>
    );
}

export function FloatingIcons() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Sol Üst - Kitap */}
            <div className="absolute top-20 left-20 text-7xl opacity-90 animate-float-slow filter drop-shadow-xl hover:scale-125 transition-transform duration-500">
                📚
            </div>

            {/* Sağ Üst - Zil */}
            <div className="absolute top-40 right-20 text-6xl opacity-90 animate-float-reverse filter drop-shadow-xl hover:rotate-12 transition-transform duration-500">
                🔔
            </div>

            {/* Sol Alt - Kalem */}
            <div className="absolute bottom-60 left-40 text-6xl opacity-90 animate-pulse-slow filter drop-shadow-xl hover:-translate-y-4 transition-transform duration-500">
                ✏️
            </div>

            {/* Sağ Alt - Mezuniyet */}
            <div className="absolute bottom-40 right-40 text-7xl opacity-80 animate-spin-slow filter drop-shadow-xl hover:scale-110">
                🎓
            </div>

            {/* Orta - Dünya */}
            <div className="absolute top-1/3 left-1/4 text-5xl opacity-80 animate-float-slow delay-700 filter drop-shadow-lg">
                🌍
            </div>

            {/* Ekstra - Okul */}
            <div className="absolute top-1/2 right-1/4 text-6xl opacity-80 animate-bounce-slight delay-500 filter drop-shadow-lg">
                🏫
            </div>

            {/* Ekstra - Mikroskop */}
            <div className="absolute top-24 left-1/2 text-6xl opacity-80 animate-float-reverse delay-1000 filter drop-shadow-lg">
                🔬
            </div>

            {/* Ekstra - Resim Paleti */}
            <div className="absolute bottom-24 right-1/3 text-6xl opacity-80 animate-float-slow delay-300 filter drop-shadow-lg">
                🎨
            </div>

            {/* Ekstra - Müzik */}
            <div className="absolute top-1/4 right-1/3 text-5xl opacity-70 animate-pulse-slow delay-200 filter drop-shadow-lg">
                🎵
            </div>
        </div>
    );
}

export function WelcomeLottie() {
    return (
        <div className="flex justify-center mb-6 relative z-10">
            <div className="relative group cursor-pointer">
                {/* Arkadaki Parlama */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 blur-3xl opacity-60 rounded-full animate-pulse group-hover:opacity-90 transition-opacity duration-500"></div>
                {/* Ana İkon */}
                <div className="text-[120px] animate-bounce-in transform transition-transform group-hover:scale-110 duration-300 drop-shadow-2xl">
                    🏫
                </div>
                {/* Etrafındaki Küçük Yıldızlar */}
                <div className="absolute -top-6 -right-10 text-5xl animate-spin-slow filter drop-shadow-lg">✨</div>
                <div className="absolute -bottom-4 -left-10 text-4xl animate-pulse text-yellow-400 filter drop-shadow-lg">✨</div>
                <div className="absolute top-1/2 -right-12 text-3xl animate-bounce delay-300 text-orange-400 filter drop-shadow-lg">✨</div>
                <div className="absolute top-0 -left-8 text-4xl animate-pulse delay-700 text-teal-400 filter drop-shadow-lg">✨</div>
            </div>
        </div>
    );
}
