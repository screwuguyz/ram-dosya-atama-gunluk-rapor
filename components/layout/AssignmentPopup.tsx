// ============================================
// Atama Popup Bileşeni
// ============================================

"use client";

import React from "react";
import { useAppStore } from "@/stores/useAppStore";
import { CheckCircle } from "lucide-react";

export default function AssignmentPopup() {
    const assignmentPopup = useAppStore((state) => state.assignmentPopup);

    React.useEffect(() => {
        if (assignmentPopup) {
            import("canvas-confetti").then((confetti) => {
                const duration = 3000;
                const end = Date.now() + duration;

                const frame = () => {
                    confetti.default({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#0d9488', '#f97316', '#14b8a6']
                    });
                    confetti.default({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#0d9488', '#f97316', '#14b8a6']
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };
                frame();
            });
        }
    }, [assignmentPopup]);

    if (!assignmentPopup) return null;

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-3xl shadow-2xl transform animate-bounce-in pointer-events-auto">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Dosya Atandı!</h2>
                    <p className="text-lg opacity-90 mb-1">{assignmentPopup.studentName}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl">→</span>
                        <span className="text-xl font-semibold">{assignmentPopup.teacherName}</span>
                    </div>
                    <div className="mt-4 bg-white/20 px-4 py-2 rounded-full">
                        <span className="text-sm">Puan: </span>
                        <span className="font-bold">{assignmentPopup.score}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
