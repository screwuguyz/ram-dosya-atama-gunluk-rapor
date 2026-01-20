import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Cookie'yi sil
  res.cookies.set("ram_admin", "", { maxAge: 0, path: "/" });
  return res;
}
