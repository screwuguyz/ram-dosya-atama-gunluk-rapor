import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxy: Lokal tarayıcı CORS'a takılmadan Vercel'deki /api/explain'e iletir
// .env.local içine NEXT_PUBLIC_API_BASE=https://<vercel-app>.vercel.app

function addCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "*");
  res.headers.set("Vary", "Origin");
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  addCors(res);
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    if (!base) {
      const r = NextResponse.json({ error: "NEXT_PUBLIC_API_BASE tanımlı değil" }, { status: 500 });
      addCors(r);
      return r;
    }
    const target = `${base.replace(/\/$/, "")}/api/explain`;
    const body = await req.text();

    const resp = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const text = await resp.text();
    const out = new NextResponse(text, { status: resp.status });
    // Gelen başlıklardan CORS dışındaki önemli olanları geçir (opsiyonel)
    out.headers.set("Content-Type", resp.headers.get("Content-Type") || "application/json");
    addCors(out);
    return out;
  } catch (e: any) {
    const r = NextResponse.json({ error: "Proxy hatası", details: String(e?.message || e) }, { status: 500 });
    addCors(r);
    return r;
  }
}
