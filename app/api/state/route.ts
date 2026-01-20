// app/api/state/route.ts (Supabase-backed)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { FeatureFlags } from "@/lib/featureFlags";
import { getErrorMessage } from "@/lib/errorUtils";

export const runtime = "nodejs";

// SECURITY FIX: Removed NODE_TLS_REJECT_UNAUTHORIZED option
// If you have SSL issues, fix the certificate, don't disable verification

import type {
  Teacher,
  CaseFile,
  Announcement,
  Settings,
  ThemeSettings,
  EArchiveEntry,
  AbsenceRecord,
  QueueTicket
} from "@/types";

type StateShape = {
  teachers: Teacher[];
  cases: CaseFile[];
  history: Record<string, CaseFile[]>;
  lastRollover: string;
  lastAbsencePenalty?: string;
  announcements?: Announcement[];
  settings?: Settings;
  themeSettings?: ThemeSettings; // Tema ayarları
  eArchive?: EArchiveEntry[]; // E-Arşiv (tüm atanmış dosyalar)
  absenceRecords?: AbsenceRecord[]; // Devamsızlık kayıtları (öğretmen ID + tarih)

  // DEPRECATED: Queue moved to separate queue_tickets table
  // Only kept for backward compatibility (NEXT_PUBLIC_USE_SEPARATE_QUEUE=false)
  queue?: QueueTicket[];

  // Versioning (for conflict detection)
  version?: number;

  updatedAt?: string;
};

// Table: public.app_state(id text PK, state jsonb, updated_at timestamptz)
const DEFAULT_STATE: StateShape = {
  teachers: [],
  cases: [],
  history: {},
  lastRollover: "",
  lastAbsencePenalty: "",
  announcements: [],
  settings: undefined,
  eArchive: [],
  absenceRecords: [],
  queue: [],
  updatedAt: undefined,
};

// Helper to transform teacher from DB to App format
function transformTeacher(t: any): Teacher {
  return {
    id: t.id,
    name: t.name,
    yearlyLoad: t.yearly_load,
    monthly: t.monthly,
    isAbsent: t.is_absent,
    backupDay: t.backup_day,
    isTester: t.is_tester,
    active: t.active,
    pushoverKey: t.pushover_key,
    isPhysiotherapist: t.is_physiotherapist,
    birthDate: t.birth_date,
  };
}

// Helper to transform App teacher to DB format
function transformTeacherToDB(t: Teacher): any {
  return {
    id: t.id,
    name: t.name,
    yearly_load: t.yearlyLoad || 0,
    monthly: t.monthly || {},
    is_absent: t.isAbsent || false,
    backup_day: t.backupDay || null,
    is_tester: t.isTester || false,
    active: t.active !== undefined ? t.active : true,
    pushover_key: t.pushoverKey || null,
    is_physiotherapist: t.isPhysiotherapist || false,
    // Database might require score, let's assume it matches yearlyLoad or 0
    score: t.yearlyLoad || 0,
  };
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    console.error("[api/state][GET] Missing env vars: URL=", !!url, "ANON=", !!anon);
    return NextResponse.json({ ...DEFAULT_STATE, _error: "Missing Supabase env vars" }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const client = createClient(url, anon);

    // 1. Fetch base state from app_state table
    const { data, error } = await client
      .from("app_state")
      .select("state")
      .eq("id", "global")
      .maybeSingle();

    if (error) {
      console.error("[api/state][GET] Supabase error:", error);
      throw error;
    }

    const s = (data?.state as StateShape) || DEFAULT_STATE;

    // 2. Override with dedicated tables if Feature Flags are enabled

    // Teachers Table
    if (FeatureFlags.USE_TEACHERS_TABLE) {
      const { data: teachersData, error: teachersError } = await client
        .from("teachers")
        .select("*")
        .order("name", { ascending: true });

      if (!teachersError && teachersData) {
        s.teachers = teachersData.map(transformTeacher);
        console.log(`[api/state][GET] Loaded ${s.teachers.length} teachers from dedicated table`);
      } else if (teachersError) {
        console.error("[api/state][GET] Error loading teachers table:", teachersError);
      }
    }

    // TODO: Implement Cases and History table support when schemas are confirmed
    // if (FeatureFlags.USE_CASES_TABLE) { ... }
    // if (FeatureFlags.USE_HISTORY_TABLE) { ... }

    console.log("[api/state][GET] Success, teachers count:", s.teachers?.length || 0);
    return NextResponse.json(s, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const errorMsg = getErrorMessage(err);
    console.error("[api/state][GET]", errorMsg);
    return NextResponse.json({ ...DEFAULT_STATE, _error: errorMsg }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: NextRequest) {
  // SECURITY: Admin authentication with feature flag control
  // When REQUIRE_ADMIN_AUTH is true (production default), check auth cookie
  // When false (local dev only), skip auth check
  if (FeatureFlags.REQUIRE_ADMIN_AUTH) {
    const isAdmin = req.cookies.get("ram_admin")?.value === "1";
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: Partial<StateShape> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  // Basic shape guards
  const s: StateShape = {
    teachers: Array.isArray(body.teachers) ? (body.teachers as Teacher[]) : [],
    cases: Array.isArray(body.cases) ? (body.cases as CaseFile[]) : [],
    history: (body.history && typeof body.history === "object") ? (body.history as Record<string, CaseFile[]>) : {},
    lastRollover: String(body.lastRollover ?? ""),
    lastAbsencePenalty: body.lastAbsencePenalty ? String(body.lastAbsencePenalty) : undefined,
    announcements: Array.isArray(body.announcements) ? (body.announcements as Announcement[]) : [],
    settings: body.settings as Settings | undefined,
    themeSettings: body.themeSettings as ThemeSettings | undefined,
    eArchive: Array.isArray(body.eArchive) ? (body.eArchive as EArchiveEntry[]) : [],
    absenceRecords: Array.isArray(body.absenceRecords) ? (body.absenceRecords as AbsenceRecord[]) : [],
    queue: Array.isArray(body.queue) ? (body.queue as QueueTicket[]) : [],
    version: body.version,
    updatedAt: body.updatedAt ? String(body.updatedAt) : new Date().toISOString(),
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !service) {
    console.error("[api/state][POST] Missing env vars: URL=", !!url, "SERVICE_KEY=", !!service);
    return NextResponse.json({ ok: false, error: "Missing Supabase envs (URL or SERVICE_ROLE_KEY)" }, { status: 500 });
  }

  try {
    const admin = createClient(url, service);

    // Versioning: Check for conflicts if feature enabled
    const useVersioning = process.env.NEXT_PUBLIC_USE_VERSIONING === 'true';
    if (useVersioning && body.version) {
      const { data: currentState } = await admin
        .from("app_state")
        .select("state")
        .eq("id", "global")
        .maybeSingle();

      const currentVersion = (currentState?.state as StateShape)?.version || 0;

      if (currentVersion > body.version) {
        console.warn("[api/state][POST] Version conflict detected:", {
          incoming: body.version,
          current: currentVersion
        });
        return NextResponse.json({
          ok: false,
          error: "Version conflict",
          conflict: true,
          currentVersion,
          incomingVersion: body.version
        }, { status: 409 });
      }
    }

    // Force server timestamp to prevent clock skew issues
    s.updatedAt = new Date().toISOString();

    const { error } = await admin
      .from("app_state")
      .upsert({ id: "global", state: s, updated_at: s.updatedAt })
      .single();
    if (error) {
      console.error("[api/state][POST] Supabase error:", error);
      throw error;
    }

    // 2. Migration: Sync to dedicated tables if enabled
    if (FeatureFlags.USE_TEACHERS_TABLE) {
      const dbTeachers = s.teachers.map(transformTeacherToDB);
      if (dbTeachers.length > 0) {
        const { error: teachersError } = await admin
          .from("teachers")
          .upsert(dbTeachers);

        if (teachersError) {
          console.error("[api/state][POST] Error syncing teachers table:", teachersError);
          return NextResponse.json({ ok: false, error: "Teachers Table Sync Error: " + teachersError.message }, { status: 500 });
        }
      }
    }

    console.log("[api/state][POST] Success, teachers count:", s.teachers?.length || 0, "version:", s.version);
    return NextResponse.json({ ok: true, version: s.version, updatedAt: s.updatedAt });
  } catch (err: unknown) {
    const errorMsg = getErrorMessage(err);
    console.error("[api/state][POST]", errorMsg);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
