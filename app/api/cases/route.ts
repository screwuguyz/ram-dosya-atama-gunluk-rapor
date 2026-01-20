// ============================================
import { getErrorMessage } from "@/lib/errorUtils";
// RAM Dosya Atama - Cases API (Dedicated Table)
// Week 5-8: CRUD operations for cases table
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { FeatureFlags } from "@/lib/featureFlags";

export const runtime = "nodejs";

/**
 * GET /api/cases?date=YYYY-MM-DD or ?teacherId=xxx
 */
export async function GET(req: NextRequest) {
  if (!FeatureFlags.USE_CASES_TABLE) {
    return NextResponse.json(
      { ok: false, error: "Cases table not enabled" },
      { status: 501 }
    );
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const teacherId = searchParams.get("teacherId");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const client = createClient(url, anon);

    let data, error;

    if (date) {
      // Get cases by date using RPC
      ({ data, error } = await client.rpc("get_cases_by_date", {
        target_date: date,
      }));
    } else if (teacherId) {
      // Get teacher cases using RPC
      ({ data, error } = await client.rpc("get_teacher_cases", {
        teacher_id: teacherId,
      }));
    } else {
      // Get all cases (limit to recent)
      ({ data, error } = await client
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000));
    }

    if (error) throw error;

    // Transform to match CaseFile type
    const cases = (data || []).map((c: any) => ({
      id: c.id,
      student: c.student,
      score: c.score,
      assignedTo: c.assigned_to,
      createdAt: c.created_at,
      type: c.type,
      isNew: c.is_new,
      isTest: c.is_test,
      absencePenalty: c.absence_penalty,
      backupBonus: c.backup_bonus,
      assignReason: c.assign_reason,
      diagCount: c.diag_count,
    }));

    return NextResponse.json({ ok: true, cases });
  } catch (error: unknown) {
    console.error("[api/cases][GET]", error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cases - Create new case
 */
export async function POST(req: NextRequest) {
  if (!FeatureFlags.USE_CASES_TABLE) {
    return NextResponse.json(
      { ok: false, error: "Cases table not enabled" },
      { status: 501 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    const body = await req.json();
    const { case: caseData } = body;

    if (!caseData || !caseData.id) {
      return NextResponse.json(
        { ok: false, error: "Case data required" },
        { status: 400 }
      );
    }

    const client = createClient(url, serviceKey);

    const { data, error } = await client
      .from("cases")
      .insert({
        id: caseData.id,
        student: caseData.student,
        score: caseData.score,
        assigned_to: caseData.assignedTo || null,
        created_at: caseData.createdAt || new Date().toISOString(),
        type: caseData.type,
        is_new: caseData.isNew || false,
        is_test: caseData.isTest || false,
        absence_penalty: caseData.absencePenalty || false,
        backup_bonus: caseData.backupBonus || false,
        assign_reason: caseData.assignReason || null,
        diag_count: caseData.diagCount || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      case: {
        id: data.id,
        student: data.student,
        score: data.score,
        assignedTo: data.assigned_to,
        createdAt: data.created_at,
        type: data.type,
        isNew: data.is_new,
        isTest: data.is_test,
        absencePenalty: data.absence_penalty,
        backupBonus: data.backup_bonus,
        assignReason: data.assign_reason,
        diagCount: data.diag_count,
      },
    });
  } catch (error: unknown) {
    console.error("[api/cases][POST]", error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
