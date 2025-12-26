// Robust add Dec 24 bonuses
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    // 1. Fetch
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    // 2. Prepare Data
    if (!state.history["2025-12-24"]) state.history["2025-12-24"] = [];

    const aygunId = "45zvjwn";
    const nurayId = "wttamdj";

    // Remove if exists
    state.history["2025-12-24"] = state.history["2025-12-24"].filter(c =>
        !((c.assignedTo === aygunId || c.assignedTo === nurayId) && c.backupBonus)
    );

    // Add new
    const bonuses = [
        {
            id: `manual-aygun-20251224-${Date.now()}`,
            student: "AYGÜN ÇELİK - Bonus",
            score: 3,
            createdAt: "2025-12-24T12:00:00.000Z",
            assignedTo: aygunId,
            type: "DESTEK",
            isNew: false,
            diagCount: 0,
            isTest: false,
            backupBonus: true,
            assignReason: "Manuel ekleme: +3"
        },
        {
            id: `manual-nuray-20251224-${Date.now()}`,
            student: "NURAY KIZILGÜNEŞ - Bonus",
            score: 3,
            createdAt: "2025-12-24T12:00:00.000Z",
            assignedTo: nurayId,
            type: "DESTEK",
            isNew: false,
            diagCount: 0,
            isTest: false,
            backupBonus: true,
            assignReason: "Manuel ekleme: +3"
        }
    ];
    state.history["2025-12-24"].push(...bonuses);

    // 3. Save
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
        console.log("✅ Saved successfully.");
        // Verify
        const verifyRes = await fetch(`${url}/rest/v1/app_state?id=eq.global&select=state`, {
            headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
        });
        const vData = await verifyRes.json();
        const vHist = vData[0].state.history["2025-12-24"];
        console.log("Verified Content:");
        vHist?.forEach(c => console.log(`  ${c.student}: ${c.score}`));
    } else {
        console.error("❌ Save failed:", await res.text());
    }
})();
