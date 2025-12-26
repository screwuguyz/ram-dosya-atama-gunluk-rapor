// Script: Eray 19.12.2025 Puan Sil (12 -> 0/Sil)
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    // Eray ID: rnycdxd
    const teacherId = "rnycdxd";

    if (state.history && state.history["2025-12-19"]) {
        console.log("Silinmeden önceki kayıtlar:");
        state.history["2025-12-19"].forEach(c => console.log(`  - ${c.student}: ${c.score}`));

        // Eray'ın bonusunu sil
        const originalLen = state.history["2025-12-19"].length;
        state.history["2025-12-19"] = state.history["2025-12-19"].filter(c =>
            !(c.assignedTo === teacherId && c.backupBonus)
        );

        const newLen = state.history["2025-12-19"].length;
        console.log(`\nSilinen kayıt sayısı: ${originalLen - newLen}`);

        if (originalLen === newLen) {
            console.log("⚠️ Silinecek kayıt bulunamadı!");
        } else {
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

            if (res.ok) {
                console.log("✅ Eray'ın 19.12.2025 puanı silindi.");
            } else {
                console.error("Hata:", await res.text());
            }
        }
    } else {
        console.log("⚠️ 2025-12-19 tarihi için kayıt yok.");
    }
})();
