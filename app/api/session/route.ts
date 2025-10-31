// app/api/session/route.ts
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get("ram_admin")?.value === "1";
  return NextResponse.json({ isAdmin });
}
