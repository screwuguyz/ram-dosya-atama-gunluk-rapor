import { useCallback, useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import confetti from "canvas-confetti";

let audioCtx: AudioContext | null = null;

function getAudioCtx() {
    if (!audioCtx) {
        if (typeof window !== "undefined") {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            if (Ctx) {
                audioCtx = new Ctx();
            }
        }
    }
    return audioCtx;
}

function resumeAudioIfNeeded() {
    const ctx = getAudioCtx();
    if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => { });
    }
}

export function useAudio() {
    const { soundOn } = useAppStore();
    const soundOnRef = useRef(soundOn);

    useEffect(() => {
        soundOnRef.current = soundOn;
    }, [soundOn]);

    // Modern ses efekti: ADSR envelope ile
    const playTone = useCallback((freq: number, durationSec = 0.14, volume = 0.18, type: OscillatorType = "sine", attack = 0.01, decay = 0.05, sustain = 0.7, release = 0.1) => {
        if (!soundOnRef.current) return;
        const ctx = getAudioCtx();
        if (!ctx) return;
        resumeAudioIfNeeded();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;

        const now = ctx.currentTime;
        const attackEnd = now + attack;
        const decayEnd = attackEnd + decay;
        const releaseStart = now + durationSec - release;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, attackEnd);
        gain.gain.linearRampToValueAtTime(volume * sustain, decayEnd);
        gain.gain.setValueAtTime(volume * sustain, releaseStart);
        gain.gain.linearRampToValueAtTime(0, now + durationSec);

        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + durationSec);
    }, []);

    const playClickSound = useCallback(() => {
        // Modern hafif tık sesi
        playTone(800, 0.04, 0.1, "sine", 0.001, 0.01, 0.6, 0.02);
    }, [playTone]);

    const playAssignSound = useCallback(() => {
        if (!soundOnRef.current) return;

        // C majör akor (C-E-G)
        playTone(523.25, 0.2, 0.2, "sine", 0.02, 0.05, 0.7, 0.1);  // C5
        playTone(659.25, 0.2, 0.18, "sine", 0.02, 0.05, 0.7, 0.1); // E5
        playTone(783.99, 0.2, 0.16, "sine", 0.02, 0.05, 0.7, 0.1); // G5

        // Yükselen melodi
        setTimeout(() => playTone(659.25, 0.15, 0.18, "sine", 0.01, 0.03, 0.8, 0.08), 220);
        setTimeout(() => playTone(783.99, 0.18, 0.2, "sine", 0.01, 0.03, 0.8, 0.1), 380);
        setTimeout(() => playTone(1046.50, 0.2, 0.22, "sine", 0.01, 0.03, 0.8, 0.12), 560); // C6
    }, [playTone]);

    const playEmergencySound = useCallback(() => {
        if (!soundOnRef.current) return;

        // Modern uyarı sesi
        playTone(880, 0.12, 0.25, "square", 0.005, 0.02, 0.9, 0.05);
        setTimeout(() => playTone(660, 0.14, 0.25, "square", 0.005, 0.02, 0.9, 0.05), 140);
        setTimeout(() => playTone(880, 0.12, 0.28, "square", 0.005, 0.02, 0.9, 0.05), 280);
        setTimeout(() => playTone(1100, 0.15, 0.3, "square", 0.005, 0.02, 0.9, 0.05), 420);
    }, [playTone]);

    const playAnnouncementSound = useCallback(() => {
        if (!soundOnRef.current) return;
        playTone(784, 0.1, 0.16, "sine", 0.01, 0.02, 0.8, 0.05); // G5
        setTimeout(() => playTone(988, 0.12, 0.18, "sine", 0.01, 0.02, 0.8, 0.06), 120); // B5
        setTimeout(() => playTone(1175, 0.14, 0.2, "sine", 0.01, 0.02, 0.8, 0.08), 240); // D6
    }, [playTone]);

    const triggerFireworks = useCallback(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }, []);

    // Global click listener
    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            // Direct access to ref to avoid stale closure if effect assumes stable callback
            // But playClickSound uses playTone which checks ref.
            if (!soundOnRef.current) return;

            const el = e.target as HTMLElement | null;
            if (!el) return;
            const btn = el.closest("button");
            if (!btn) return;

            if ((btn as HTMLButtonElement).disabled) return;
            if (btn.getAttribute("data-silent") === "true") return;

            playClickSound();
        };

        document.addEventListener("pointerdown", onPointerDown, { capture: true });
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [playClickSound]);

    return {
        playAssignSound,
        playEmergencySound,
        triggerFireworks,
        playTone,
        playClickSound,
        playAnnouncementSound
    };
}
