"use client";
import { useEffect, useState } from "react";

export default function AdminLogin({
  onAuthChange,
}: { onAuthChange?: (isAdmin: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    fetch("/api/session")
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((d: any) => {
        setIsAdmin(!!d.isAdmin);
        onAuthChange?.(!!d.isAdmin);
      })
      .catch(() => {});
  }, [onAuthChange]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        setErr("Giriş başarısız. E-posta/şifreyi kontrol edin.");
        return;
      }
      setIsAdmin(true);
      onAuthChange?.(true);
      setEmail("");
      setPassword("");
    } catch {
      setErr("Giriş sırasında hata oluştu.");
    }
  }

  async function handleLogout() {
    setErr("");
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    setIsAdmin(false);
    onAuthChange?.(false);
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <>
          <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800">Admin</span>
          <button className="px-3 py-1 border rounded bg-white/90 hover:bg-white" onClick={handleLogout}>
            Çıkış
          </button>
        </>
      ) : (
        <form onSubmit={handleLogin} className="flex items-center gap-2">
          <input
            type="email"
            placeholder="Admin e-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-2 py-1 rounded"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-2 py-1 rounded"
            required
          />
          <button className="px-3 py-1 border rounded bg-white/90 hover:bg-white" type="submit">
            Giriş
          </button>
          {err && <span className="text-xs text-rose-600 ml-2">{err}</span>}
        </form>
      )}
    </div>
  );
}
