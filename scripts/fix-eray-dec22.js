// Script: 22.12.2025 için Eray'ın bonusunu 10 yap (5→15)
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function fixEray22() {
    const supabase = createClient(url, serviceKey);

    const { data: currentData } = await supabase
        .from("app_state")
        .select("state")
        .eq("id", "global")
        .single();

    const state = currentData.state;
    const eray = state.teachers?.find(t => t.name.includes("ERAY"));

    console.log("Eray ID:", eray.id);

    // 22 Aralık'taki Eray bonus'unu güncelle
    if (state.history["2025-12-22"]) {
        state.history["2025-12-22"] = state.history["2025-12-22"].map(c => {
            if (c.backupBonus && c.assignedTo === eray.id) {
                return { ...c, score: 10, assignReason: "Başkan yedek bonusu: +10 puan (5→15)" };
            }
            return c;
        });
    }

    // REST API ile kaydet
    const patchResponse = await fetch(`${url}/rest/v1/app_state?id=eq.global`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            state: state,
            updated_at: new Date().toISOString()
        })
    });

    if (patchResponse.ok) {
        const result = await patchResponse.json();
        const dec22 = result[0]?.state?.history?.["2025-12-22"] || [];
        console.log("\n✅ Güncellendi! 2025-12-22 bonusları:");
        dec22.filter(c => c.backupBonus).forEach(c => console.log(`   - ${c.student} | ${c.score} puan`));
    } else {
        console.error("Hata:", await patchResponse.text());
    }
}

fixEray22().catch(console.error);
