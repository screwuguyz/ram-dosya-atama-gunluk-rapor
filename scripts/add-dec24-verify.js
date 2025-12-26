// Retry Dec 24 bonuses with verification loop
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

const supabase = createClient(url, serviceKey);

async function run() {
    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
        attempts++;
        console.log(`\nAttempt ${attempts}...`);

        // 1. Fetch
        const { data, error } = await supabase.from("app_state").select("state").eq("id", "global").single();
        if (error) { console.error("Fetch error:", error); continue; }

        let state = data.state;

        // 2. Modify
        if (!state.history) state.history = {};
        if (!state.history["2025-12-24"]) state.history["2025-12-24"] = [];

        const aygunId = "45zvjwn";
        const nurayId = "wttamdj";

        // Remove existing bonuses for these users to prevent duplicates
        state.history["2025-12-24"] = state.history["2025-12-24"].filter(c =>
            !((c.assignedTo === aygunId || c.assignedTo === nurayId) && c.backupBonus)
        );

        // Add
        state.history["2025-12-24"].push(
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
        );

        // 3. Update
        const { error: updateError } = await supabase
            .from("app_state")
            .update({ state: state, updated_at: new Date().toISOString() })
            .eq("id", "global");

        if (updateError) { console.error("Update error:", updateError); continue; }

        // 4. Verify
        console.log("Verifying...");
        const { data: vData } = await supabase.from("app_state").select("state").eq("id", "global").single();
        const vHist = vData.state.history["2025-12-24"];

        const hasAygun = vHist?.some(c => c.assignedTo === aygunId && c.backupBonus);
        const hasNuray = vHist?.some(c => c.assignedTo === nurayId && c.backupBonus);

        if (hasAygun && hasNuray) {
            console.log("✅ Verified! Data is persistent.");
            vHist.filter(c => c.backupBonus).forEach(c => console.log(`   - ${c.student}: ${c.score}`));
            success = true;
        } else {
            console.error("❌ Verification failed. Retrying...");
        }
    }
}

run();
