import { NextResponse } from "next/server";

/**
 * Logging endpoint geçici olarak devre dışı.
 * Vercel build'in "module değil" hatasını çözmek için stub handler döner.
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Logs endpoint disabled" },
    { status: 501 }
  );
}

export async function POST(req: Request) {
  // İleride kalıcı loglama eklendiğinde burası güncellenecek.
  const body = await req.text().catch(() => "");
  return NextResponse.json(
    { ok: false, message: "Logs endpoint disabled", received: body ? true : false },
    { status: 501 }
  );
}

