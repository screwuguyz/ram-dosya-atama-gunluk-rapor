// lib/supabase.ts
import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";

// Env'leri string'e sabitle (TS'nin "string | undefined" itirazını keser)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Geliştirme/preview'da eksik env'yi erken yakala (opsiyonel ama faydalı)
if (!url || !key) {
  throw new Error(
    "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// -> Eğer kütüphane sürümün ^2.x ise bu blok problemsiz çalışır:
export const supabase = createClient(url, key, {
  realtime: { params: { eventsPerSecond: 10 } },
} satisfies SupabaseClientOptions<any>);

// ----- Eğer yine tip hatası alırsan (eski 1.x sürümü ise) ŞU İKİNDEN BİRİNİ DENE -----
// 1) En basit: (3. opsiyonu kaldır)
/// export const supabase = createClient(url, key);

// 2) V2'ye yükselt:  npm i @supabase/supabase-js@^2
