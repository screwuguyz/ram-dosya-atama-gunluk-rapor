"use client";
import { getErrorMessage } from "@/lib/errorUtils";

import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QueueTicket } from "@/types";

// Dedicated hook for queue synchronization
// Uses separate queue_tickets table with realtime subscription
export function useQueueSync() {
    const [tickets, setTickets] = useState<QueueTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<any>(null);

    // Fetch all tickets from API
    const fetchTickets = useCallback(async () => {
        try {
            const res = await fetch("/api/queue-v2", { cache: "no-store", headers: { "Pragma": "no-cache" } });
            const data = await res.json();

            if (data.ok && Array.isArray(data.tickets)) {
                setTickets(data.tickets);
                setError(null);
            } else {
                setError(data.error || "Failed to fetch tickets");
            }
        } catch (err: unknown) {
            console.error("[useQueueSync] Fetch error:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    // Add new ticket
    const addTicket = useCallback(async (name?: string): Promise<QueueTicket | null> => {
        try {
            const res = await fetch("/api/queue-v2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();

            if (data.ok && data.ticket) {
                // Optimistic update - add to local state immediately
                setTickets(prev => [...prev, data.ticket]);
                return data.ticket;
            }
            return null;
        } catch (err: unknown) {
            console.error("[useQueueSync] Add error:", err);
            return null;
        }
    }, []);

    // Call ticket (change status to 'called')
    const callTicket = useCallback(async (id: string, calledBy?: string) => {
        try {
            // Optimistic update
            setTickets(prev => prev.map(t =>
                t.id === id
                    ? { ...t, status: 'called' as const, calledBy, updatedAt: new Date().toISOString() }
                    : t
            ));

            const res = await fetch("/api/queue-v2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "called", calledBy }),
            });
            const data = await res.json();

            if (!data.ok) {
                // Revert on failure
                await fetchTickets();
            }
        } catch (err: unknown) {
            console.error("[useQueueSync] Call error:", err);
            await fetchTickets();
        }
    }, [fetchTickets]);

    // Complete ticket (change status to 'done')
    const completeTicket = useCallback(async (id: string) => {
        try {
            // Optimistic update
            setTickets(prev => prev.map(t =>
                t.id === id
                    ? { ...t, status: 'done' as const, updatedAt: new Date().toISOString() }
                    : t
            ));

            const res = await fetch("/api/queue-v2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "done" }),
            });
            const data = await res.json();

            if (!data.ok) {
                await fetchTickets();
            }
        } catch (err: unknown) {
            console.error("[useQueueSync] Complete error:", err);
            await fetchTickets();
        }
    }, [fetchTickets]);

    // Clear all tickets (reset queue)
    const clearAll = useCallback(async () => {
        try {
            setTickets([]);

            const res = await fetch("/api/queue-v2", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clearAll: true }),
            });
            const data = await res.json();

            if (!data.ok) {
                await fetchTickets();
            }
        } catch (err: unknown) {
            console.error("[useQueueSync] Clear error:", err);
            await fetchTickets();
        }
    }, [fetchTickets]);

    // Setup realtime subscription
    // QUEUE_ENABLED env var ile kontrol edilir (varsayılan: kapalı)
    const isQueueEnabled = process.env.NEXT_PUBLIC_QUEUE_ENABLED === "1";

    useEffect(() => {
        // Queue devre dışıysa hiçbir şey yapma (CPU tasarrufu)
        if (!isQueueEnabled) {
            console.log("[useQueueSync] Queue disabled via NEXT_PUBLIC_QUEUE_ENABLED");
            setLoading(false);
            return;
        }

        // Initial fetch
        fetchTickets();

        // Subscribe to realtime changes
        if (supabase) {
            const channel = supabase
                .channel("queue_tickets_realtime")
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "queue_tickets" },
                    (payload: any) => {
                        console.log("[useQueueSync] Realtime event:", payload.eventType);

                        if (payload.eventType === "INSERT") {
                            const record = payload.new;

                            // Type guard and validation
                            if (!record || typeof record !== 'object' || !record.id) {
                                console.warn("[useQueueSync] Invalid INSERT payload", record);
                                return;
                            }

                            const newTicket: QueueTicket = {
                                id: String(record.id),
                                no: Number(record.no ?? 0),
                                name: String(record.name || 'Misafir'),
                                status: ['waiting', 'called', 'done'].includes(record.status)
                                    ? record.status
                                    : 'waiting',
                                calledBy: record.called_by ? String(record.called_by) : undefined,
                                createdAt: String(record.created_at ?? new Date().toISOString()),
                                updatedAt: String(record.updated_at ?? new Date().toISOString()),
                            };

                            // 3 saniye gecikme - yazıcının fişi basması için zaman tanı
                            setTimeout(() => {
                                setTickets(prev => {
                                    // Avoid duplicates
                                    if (prev.some(t => t.id === newTicket.id)) return prev;
                                    return [...prev, newTicket];
                                });
                            }, 3000);
                        }
                        else if (payload.eventType === "UPDATE") {
                            const record = payload.new;

                            if (!record || typeof record !== 'object' || !record.id) {
                                console.warn("[useQueueSync] Invalid UPDATE payload", record);
                                return;
                            }

                            setTickets(prev => prev.map(t =>
                                t.id === String(record.id)
                                    ? {
                                        ...t,
                                        status: ['waiting', 'called', 'done'].includes(record.status)
                                            ? record.status
                                            : t.status,
                                        calledBy: record.called_by ? String(record.called_by) : undefined,
                                        updatedAt: String(record.updated_at ?? new Date().toISOString()),
                                    }
                                    : t
                            ));
                        }
                        else if (payload.eventType === "DELETE") {
                            const record = payload.old;

                            if (!record || typeof record !== 'object' || !record.id) {
                                console.warn("[useQueueSync] Invalid DELETE payload", record);
                                return;
                            }

                            setTickets(prev => prev.filter(t => t.id !== String(record.id)));
                        }
                    }
                )
                .subscribe((status) => {
                    console.log("[useQueueSync] Subscription status:", status);
                });

            channelRef.current = channel;
        }

        // Backup polling every 5 seconds (in case realtime fails)
        const interval = setInterval(fetchTickets, 5000);

        return () => {
            clearInterval(interval);
            if (channelRef.current && supabase) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [fetchTickets, isQueueEnabled]);

    // Computed values
    const waitingTickets = tickets
        .filter(t => t.status === "waiting")
        .sort((a, b) => (a.no || 0) - (b.no || 0));

    const calledTickets = tickets
        .filter(t => t.status === "called")
        .sort((a, b) => {
            const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return bTime - aTime; // Most recent first
        });

    const currentTicket = calledTickets[0] || null;

    return {
        tickets,
        waitingTickets,
        calledTickets,
        currentTicket,
        loading,
        error,
        addTicket,
        callTicket,
        completeTicket,
        clearAll,
        refresh: fetchTickets,
    };
}
