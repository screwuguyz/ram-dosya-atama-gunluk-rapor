import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key);
}

// GET: List all tickets
export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from("queue_tickets")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) throw error;

        // Transform to frontend format
        const tickets = (data || []).map(t => ({
            id: t.id,
            no: t.no,
            name: t.name || "Misafir",
            status: t.status,
            calledBy: t.called_by,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
        }));

        return NextResponse.json({ ok: true, tickets });
    } catch (err: any) {
        console.error("[queue-v2 GET]", err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}

// POST: Add new ticket
export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();
        const supabase = getSupabaseAdmin();

        // Türkiye saatine göre bugünün başlangıcını hesapla (UTC+3)
        const now = new Date();
        const turkeyTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        const todayStart = turkeyTime.toISOString().slice(0, 10) + "T00:00:00+03:00";

        // console.log("[queue-v2 POST] Today start (Turkey):", todayStart);

        // Bugün oluşturulan TÜM biletlerin (done dahil) en yüksek numarasını al
        const { data: existing, error: fetchError } = await supabase
            .from("queue_tickets")
            .select("no")
            .gte("created_at", todayStart)
            .order("no", { ascending: false })
            .limit(1);

        if (fetchError) {
            console.error("[queue-v2 POST] Fetch error:", fetchError);
        }

        const maxNo = existing && existing.length > 0 ? existing[0].no : 0;
        // console.log("[queue-v2 POST] Max ticket no today:", maxNo, "Next will be:", maxNo + 1);

        // Insert new ticket
        const { data, error } = await supabase
            .from("queue_tickets")
            .insert({
                no: maxNo + 1,
                name: name?.trim() || "Misafir",
                status: "waiting",
            })
            .select()
            .single();

        if (error) throw error;

        const ticket = {
            id: data.id,
            no: data.no,
            name: data.name,
            status: data.status,
            calledBy: data.called_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };

        // console.log("[queue-v2 POST] Created ticket:", ticket.no);

        return NextResponse.json({ ok: true, ticket });
    } catch (err: any) {
        console.error("[queue-v2 POST]", err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}

// PUT: Update ticket status
export async function PUT(req: NextRequest) {
    try {
        const { id, status, calledBy } = await req.json();
        const supabase = getSupabaseAdmin();

        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (calledBy !== undefined) {
            updateData.called_by = calledBy;
        }

        const { data, error } = await supabase
            .from("queue_tickets")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        // console.log("[queue-v2 PUT] Updated ticket:", id, "->", status);

        return NextResponse.json({ ok: true, ticket: data });
    } catch (err: any) {
        console.error("[queue-v2 PUT]", err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}

// DELETE: Remove ticket or clear all
export async function DELETE(req: NextRequest) {
    try {
        const { id, clearAll } = await req.json();
        const supabase = getSupabaseAdmin();

        if (clearAll) {
            // Bugünün biletlerini SİLME - waiting olanları done yap
            // Böylece numaralama korunur
            const { error } = await supabase
                .from("queue_tickets")
                .update({ status: "done", updated_at: new Date().toISOString() })
                .eq("status", "waiting");

            if (error) throw error;
            // console.log("[queue-v2 DELETE] Marked all waiting tickets as done");
        } else if (id) {
            // Tek bilet için: done olarak işaretle
            const { error } = await supabase
                .from("queue_tickets")
                .update({ status: "done", updated_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;
            // console.log("[queue-v2 DELETE] Marked ticket as done:", id);
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("[queue-v2 DELETE]", err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
