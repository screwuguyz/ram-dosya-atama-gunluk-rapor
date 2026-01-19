// ============================================
import { getErrorMessage } from "@/lib/errorUtils";
// RAM Dosya Atama - Backup API
// ============================================

import { NextRequest, NextResponse } from "next/server";
import {
  createManualBackup,
  restoreFromBackup,
  listBackups,
  exportStateAsJSON,
} from "@/lib/backup";

export const runtime = "nodejs";

/**
 * GET /api/backup - List all backups or export current state
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "export") {
      const result = await exportStateAsJSON();
      if (!result.success) {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: 500 }
        );
      }

      return new NextResponse(result.json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": \`attachment; filename="ram-backup-\${Date.now()}.json"\`,
        },
      });
    }

    // Default: List backups
    const result = await listBackups();
    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, backups: result.backups });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backup - Create a new backup
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { label = "manual-backup" } = body;

    const result = await createManualBackup(label);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      backupId: result.backupId,
      message: "Backup created successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/backup - Restore from a backup
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { backupId } = body;

    if (!backupId) {
      return NextResponse.json(
        { ok: false, error: "backupId is required" },
        { status: 400 }
      );
    }

    const result = await restoreFromBackup(backupId);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Backup restored successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
