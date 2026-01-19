// ============================================
// RAM Dosya Atama - Teachers API (Dedicated Table)
// Week 2-4: CRUD operations for teachers table
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { FeatureFlags } from "@/lib/featureFlags";

export const runtime = "nodejs";

/**
 * GET /api/teachers - List all teachers
 */
export async function GET() {
  // Only use this endpoint if feature flag is enabled
  if (!FeatureFlags.USE_TEACHERS_TABLE) {
    return NextResponse.json(
      { ok: false, error: "Teachers table not enabled" },
      { status: 501 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anon) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase credentials" },
      { status: 500 }
    );
  }

  try {
    const client = createClient(url, anon);

    const { data, error } = await client
      .from("teachers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    // Transform to match Teacher type format
    const teachers = (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      score: t.score,
      yearlyLoad: t.yearly_load,
      monthly: t.monthly,
      isAbsent: t.is_absent,
      backupDay: t.backup_day,
      isTester: t.is_tester,
      active: t.active,
      pushoverKey: t.pushover_key,
      version: t.version,
    }));

    return NextResponse.json({ ok: true, teachers });
  } catch (error: any) {
    console.error("[api/teachers][GET]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teachers - Create or update teacher
 */
export async function POST(req: NextRequest) {
  if (!FeatureFlags.USE_TEACHERS_TABLE) {
    return NextResponse.json(
      { ok: false, error: "Teachers table not enabled" },
      { status: 501 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase credentials" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { teacher, expectedVersion } = body;

    if (!teacher || !teacher.id) {
      return NextResponse.json(
        { ok: false, error: "Teacher data required" },
        { status: 400 }
      );
    }

    const client = createClient(url, serviceKey);

    // Check version conflict if expectedVersion provided
    if (expectedVersion !== undefined) {
      const { data: existing } = await client
        .from("teachers")
        .select("version")
        .eq("id", teacher.id)
        .maybeSingle();

      if (existing && existing.version !== expectedVersion) {
        return NextResponse.json(
          {
            ok: false,
            error: "Version conflict",
            conflict: true,
            currentVersion: existing.version,
            expectedVersion,
          },
          { status: 409 }
        );
      }
    }

    // Upsert teacher
    const { data, error } = await client
      .from("teachers")
      .upsert({
        id: teacher.id,
        name: teacher.name,
        score: teacher.score || 0,
        yearly_load: teacher.yearlyLoad || 0,
        monthly: teacher.monthly || {},
        is_absent: teacher.isAbsent || false,
        backup_day: teacher.backupDay || null,
        is_tester: teacher.isTester || false,
        active: teacher.active !== undefined ? teacher.active : true,
        pushover_key: teacher.pushoverKey || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      teacher: {
        id: data.id,
        name: data.name,
        score: data.score,
        yearlyLoad: data.yearly_load,
        monthly: data.monthly,
        isAbsent: data.is_absent,
        backupDay: data.backup_day,
        isTester: data.is_tester,
        active: data.active,
        pushoverKey: data.pushover_key,
        version: data.version,
      },
    });
  } catch (error: any) {
    console.error("[api/teachers][POST]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teachers - Update teacher score (atomic)
 */
export async function PATCH(req: NextRequest) {
  if (!FeatureFlags.USE_TEACHERS_TABLE) {
    return NextResponse.json(
      { ok: false, error: "Teachers table not enabled" },
      { status: 501 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase credentials" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { teacherId, scoreDelta, expectedVersion } = body;

    if (!teacherId || scoreDelta === undefined) {
      return NextResponse.json(
        { ok: false, error: "teacherId and scoreDelta required" },
        { status: 400 }
      );
    }

    const client = createClient(url, serviceKey);

    // Use RPC function for atomic update
    const { data, error } = await client.rpc("update_teacher_score", {
      teacher_id: teacherId,
      score_delta: scoreDelta,
      expected_version: expectedVersion || null,
    });

    if (error) {
      throw error;
    }

    const result = data[0];

    if (!result.success) {
      if (result.error === "Version conflict") {
        return NextResponse.json(
          {
            ok: false,
            error: "Version conflict",
            conflict: true,
            currentVersion: result.new_version,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      newVersion: result.new_version,
      newScore: result.new_score,
    });
  } catch (error: any) {
    console.error("[api/teachers][PATCH]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teachers?id=xxx - Delete teacher
 */
export async function DELETE(req: NextRequest) {
  if (!FeatureFlags.USE_TEACHERS_TABLE) {
    return NextResponse.json(
      { ok: false, error: "Teachers table not enabled" },
      { status: 501 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase credentials" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("id");

    if (!teacherId) {
      return NextResponse.json(
        { ok: false, error: "Teacher ID required" },
        { status: 400 }
      );
    }

    const client = createClient(url, serviceKey);

    const { error } = await client
      .from("teachers")
      .delete()
      .eq("id", teacherId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[api/teachers][DELETE]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
