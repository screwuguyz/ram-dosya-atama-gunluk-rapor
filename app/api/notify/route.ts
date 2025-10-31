// app/api/notify/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";        // Edge değil Node runtime'ı kullan
export const dynamic = "force-dynamic"; // olası cache/ISR etkilerini sıfırla

export async function POST(req: NextRequest) {
  try {
    // Sadece admin kullanıcılar bildirim gönderebilsin
    const isAdmin = req.cookies.get("ram_admin")?.value === "1";
    if (!isAdmin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const { userKey, title, message, priority } = await req.json();
    const token = process.env.PUSHOVER_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "No PUSHOVER_TOKEN" }, { status: 500 });
    }
    if (!userKey) {
      return NextResponse.json({ error: "No userKey" }, { status: 400 });
    }

    const effectivePriority = String(priority ?? "0");
    const body = new URLSearchParams({
      token,
      user: String(userKey),
      title: String(title ?? "Yeni Dosya Atandı"),
      message: String(message ?? ""),
      priority: effectivePriority,
    });
    // Emergency modunda (priority 2) tekrar/retry parametreleri gerekir; diğerlerinde eklenmez
    if (effectivePriority === "2") {
      body.set("retry", "60");
      body.set("expire", "3600");
      body.set("sound", "siren");
    }

    // Timeout: network sorunlarında beklemeyi sınırlamak için
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 saniye
    let res: Response;
    try {
      // Kurumsal/self-signed sertifika zinciri sorunları için sadece GELİŞTİRMEDE geçici çözüm:
      // ALLOW_INSECURE_TLS=1 ise, bu istek süresince TLS doğrulamayı devre dışı bırak.
      const insecure = process.env.ALLOW_INSECURE_TLS === "1";
      const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      if (insecure) process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      res = await fetch("https://api.pushover.net/1/messages.json", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller.signal,
      });
      if (insecure) process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls;
    } finally {
      clearTimeout(timeout);
    }

    // Pushover’ın döndürdüğü ham cevabı ilet (hata ise status ile)
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { pushover: json, status: res.status },
        { status: res.status }
      );
    }
    return NextResponse.json({ ok: true, pushover: json });
  } catch (e: any) {
    // Hata mesajını da göster ki sebebi görülsün
    return NextResponse.json(
      {
        error: "notify_failed",
        message: String(e?.message || e),
        code: e?.code,
        cause: e?.cause && (typeof e.cause === "object" ? (e.cause.code || String(e.cause)) : String(e.cause)),
        name: e?.name,
      },
      { status: 502 }
    );
  }
}
