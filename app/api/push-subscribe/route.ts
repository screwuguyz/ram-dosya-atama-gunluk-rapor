// ============================================
// Push Subscribe API - PWA Web Push Subscriptions
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { teacherId, subscription } = body;

        if (!teacherId || !subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: "Missing teacherId or subscription" },
                { status: 400 }
            );
        }

        // Store subscription in Supabase
        const { error } = await supabase
            .from("push_subscriptions")
            .upsert(
                {
                    teacher_id: teacherId,
                    endpoint: subscription.endpoint,
                    keys: subscription.keys,
                    user_agent: request.headers.get("user-agent") || null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "endpoint" }
            );

        if (error) {
            console.error("[push-subscribe] Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to save subscription" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[push-subscribe] Error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get("endpoint");

        if (!endpoint) {
            return NextResponse.json(
                { error: "Missing endpoint" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", endpoint);

        if (error) {
            console.error("[push-subscribe] Delete error:", error);
            return NextResponse.json(
                { error: "Failed to delete subscription" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[push-subscribe] Error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Get subscriptions for a teacher
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacherId");

        if (!teacherId) {
            return NextResponse.json(
                { error: "Missing teacherId" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("teacher_id", teacherId);

        if (error) {
            console.error("[push-subscribe] Get error:", error);
            return NextResponse.json(
                { error: "Failed to get subscriptions" },
                { status: 500 }
            );
        }

        return NextResponse.json({ subscriptions: data || [] });
    } catch (err) {
        console.error("[push-subscribe] Error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
