// ============================================
// Push Subscribe API - PWA Web Push Subscriptions
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getErrorMessage } from "@/lib/errorUtils";

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
        const { error } = await supabaseAdmin
            .from("push_subscriptions")
            .upsert(
                {
                    teacher_id: teacherId,
                    endpoint: subscription.endpoint,
                    keys: subscription.keys,
                    user_agent: request.headers.get("user-agent") || null,
                },
                { onConflict: "endpoint" }
            );

        if (error) {
            const errorMessage = getErrorMessage(error);
            console.error("[push-subscribe] Supabase error:", errorMessage);
            return NextResponse.json(
                { error: `Database error: ${errorMessage}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        console.error("[push-subscribe] POST error:", errorMessage);
        return NextResponse.json(
            { error: `Server error: ${errorMessage}` },
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

        const { error } = await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", endpoint);

        if (error) {
            const errorMessage = getErrorMessage(error);
            console.error("[push-subscribe] Delete error:", errorMessage);
            return NextResponse.json(
                { error: `Failed to delete subscription: ${errorMessage}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        console.error("[push-subscribe] DELETE error:", errorMessage);
        return NextResponse.json(
            { error: `Internal server error: ${errorMessage}` },
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

        const { data, error } = await supabaseAdmin
            .from("push_subscriptions")
            .select("*")
            .eq("teacher_id", teacherId);

        if (error) {
            const errorMessage = getErrorMessage(error);
            console.error("[push-subscribe] Get error:", errorMessage);
            return NextResponse.json(
                { error: `Failed to get subscriptions: ${errorMessage}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ subscriptions: data || [] });
    } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        console.error("[push-subscribe] GET error:", errorMessage);
        return NextResponse.json(
            { error: `Internal server error: ${errorMessage}` },
            { status: 500 }
        );
    }
}
