// Eray 22 Aralık = 12 puan bonus
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    console.log("Önceki 22 Aralık history:");
    state.history["2025-12-22"]?.forEach(c => console.log(`  ${c.student}: ${c.score}`));

    // Eray bonus'unu 12 yap
    const updated = state.history["2025-12-22"].map(c => {
        if (c.assignedTo === "rnycdxd" && c.backupBonus) {
            console.log("Eray bonus güncelleniyor: 2 -> 12");
            return { ...c, score: 12 };
        }
        return c;
    });
    state.history["2025-12-22"] = updated;

    // Kaydet
    const res = await fetch(`${url}/rest/v1/app_state?id=eq.global`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ state, updated_at: new Date().toISOString() })
    });

    const result = await res.json();
    console.log("\nSonraki 22 Aralık history:");
    result[0]?.state?.history?.["2025-12-22"]?.forEach(c => console.log(`  ${c.student}: ${c.score}`));
})();
