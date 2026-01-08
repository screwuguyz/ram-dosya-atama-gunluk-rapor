// ============================================
// Push Subscription Button - PWA Web Push
// ============================================

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

interface PushSubscriptionButtonProps {
    teacherId: string;
    size?: "default" | "sm" | "icon";
}

export default function PushSubscriptionButton({
    teacherId,
    size = "sm"
}: PushSubscriptionButtonProps) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const addToast = useAppStore((state) => state.addToast);

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check if push is supported
        const checkSupport = async () => {
            setIsChecking(true);

            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                setIsSupported(false);
                setIsChecking(false);
                return;
            }

            if (!vapidPublicKey) {
                setIsSupported(false);
                setIsChecking(false);
                return;
            }

            setIsSupported(true);

            // Check current subscription status with timeout
            try {
                // Timeout after 3 seconds
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 3000)
                );

                const registration = await Promise.race([
                    navigator.serviceWorker.ready,
                    timeoutPromise
                ]) as ServiceWorkerRegistration;

                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            } catch (e) {
                console.log("Service worker check skipped:", e);
            }
            setIsChecking(false);
        };

        checkSupport();
    }, [vapidPublicKey]);

    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = async () => {
        if (!vapidPublicKey) {
            addToast("Push bildirimleri yapılandırılmamış");
            return;
        }

        setIsLoading(true);
        try {
            // Request notification permission
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                addToast("Bildirim izni reddedildi");
                setIsLoading(false);
                return;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
            });

            // Send subscription to server
            const res = await fetch("/api/push-subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherId,
                    subscription: subscription.toJSON(),
                }),
            });

            if (res.ok) {
                setIsSubscribed(true);
                addToast("Bildirimler açıldı ✓");
            } else {
                throw new Error("Failed to save subscription");
            }
        } catch (e) {
            console.error("Subscribe error:", e);
            addToast("Bildirim kaydı başarısız");
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribe = async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe locally
                await subscription.unsubscribe();

                // Remove from server
                await fetch(`/api/push-subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
                    method: "DELETE",
                });
            }

            setIsSubscribed(false);
            addToast("Bildirimler kapatıldı");
        } catch (e) {
            console.error("Unsubscribe error:", e);
            addToast("Bildirim iptali başarısız");
        } finally {
            setIsLoading(false);
        }
    };

    if (isChecking || !isSupported) {
        return null; // Hide button while checking or if not supported
    }

    if (size === "icon") {
        return (
            <Button
                size="icon"
                variant={isSubscribed ? "default" : "outline"}
                onClick={isSubscribed ? unsubscribe : subscribe}
                disabled={isLoading}
                title={isSubscribed ? "Bildirimleri Kapat" : "Bildirimleri Aç"}
                className="h-8 w-8"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSubscribed ? (
                    <Bell className="h-4 w-4 text-emerald-600" />
                ) : (
                    <BellOff className="h-4 w-4" />
                )}
            </Button>
        );
    }

    return (
        <Button
            size={size}
            variant={isSubscribed ? "default" : "outline"}
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading}
            className={isSubscribed ? "text-emerald-600" : ""}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Yükleniyor...
                </>
            ) : isSubscribed ? (
                <>
                    <Bell className="h-4 w-4 mr-1" />
                    Bildirim Açık
                </>
            ) : (
                <>
                    <BellOff className="h-4 w-4 mr-1" />
                    Bildirimleri Aç
                </>
            )}
        </Button>
    );
}
