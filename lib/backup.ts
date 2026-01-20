// ============================================
// RAM Dosya Atama - Backup & Restore System
// ============================================

import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "./errorUtils";
import { FeatureFlags } from "./featureFlags";
import type { Teacher } from "@/types";

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
  };
}

export interface BackupMetadata {
  id: string;
  label: string;
  createdAt: string;
  size: number;
  version?: number;
  backup_type?: "manual" | "auto";
}

/**
 * Create a manual backup with custom label
 */
export async function createManualBackup(
  label: string = "manual-backup"
): Promise<{ success: boolean; backupId?: string; error?: string }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !serviceKey) {
      return { success: false, error: "Missing Supabase credentials" };
    }

    const client = createClient(url, serviceKey);

    // 1. Get current state
    const { data: stateData, error: stateError } = await client
      .from("app_state")
      .select("*")
      .eq("id", "global")
      .single();

    if (stateError) {
      return { success: false, error: stateError.message };
    }

    // 1.5. Override with dedicated tables if Feature Flags are enabled
    if (FeatureFlags.USE_TEACHERS_TABLE) {
      const { data: teachersData, error: teachersError } = await client
        .from("teachers")
        .select("*")
        .order("name", { ascending: true });

      if (!teachersError && teachersData && stateData?.state) {
        stateData.state.teachers = teachersData.map(transformTeacher);
        // console.log(`[backup] Included ${stateData.state.teachers.length} teachers from dedicated table`);
      }
    }

    // 2. Create backup - Let Supabase generate UUID automatically
    const backupPayload = {
      // id: removed - Supabase will auto-generate UUID via gen_random_uuid()
      created_at: new Date().toISOString(),
      backup_type: "manual",
      description: label,
      state_snapshot: stateData,
    };

    const { data: insertedBackup, error: backupError } = await client
      .from("app_backups")
      .insert(backupPayload)
      .select("id")
      .single();

    if (backupError) {
      return { success: false, error: backupError.message };
    }

    return { success: true, backupId: insertedBackup?.id };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Restore from a specific backup
 */
export async function restoreFromBackup(
  backupId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !serviceKey) {
      return { success: false, error: "Missing Supabase credentials" };
    }

    const client = createClient(url, serviceKey);

    // 1. Get backup
    const { data: backupData, error: backupError } = await client
      .from("app_backups")
      .select("state_snapshot")
      .eq("id", backupId)
      .single();

    if (backupError) {
      return { success: false, error: backupError.message };
    }

    if (!backupData?.state_snapshot) {
      return { success: false, error: "Backup data not found" };
    }

    // 2. Restore to app_state
    const { error: restoreError } = await client
      .from("app_state")
      .upsert({
        id: "global",
        state: backupData.state_snapshot.state,
        updated_at: new Date().toISOString(),
      });

    if (restoreError) {
      return { success: false, error: restoreError.message };
    }

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * List all available backups
 */
export async function listBackups(): Promise<{
  success: boolean;
  backups?: BackupMetadata[];
  error?: string;
}> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !serviceKey) {
      return { success: false, error: "Missing Supabase credentials" };
    }

    const client = createClient(url, serviceKey);

    const { data, error } = await client
      .from("app_backups")
      .select("id, created_at, description, backup_type")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return { success: false, error: error.message };
    }

    const backups = (data || []).map((b: { id: string; description?: string; backup_type?: string; created_at: string }) => ({
      id: String(b.id),
      label: String(b.description || b.backup_type || 'backup'),
      createdAt: String(b.created_at),
      size: 0, // We could calculate this if needed
      backup_type: b.backup_type as "manual" | "auto" | undefined,
    }));

    return { success: true, backups };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Export current state as JSON file
 */
export async function exportStateAsJSON(): Promise<{
  success: boolean;
  json?: string;
  error?: string;
}> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !serviceKey) {
      return { success: false, error: "Missing Supabase credentials" };
    }

    const client = createClient(url, serviceKey);

    const { data, error } = await client
      .from("app_state")
      .select("*")
      .eq("id", "global")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const json = JSON.stringify(data, null, 2);
    return { success: true, json };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
