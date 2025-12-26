// Add Aygün Dec 19 +3
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

        const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
        let state = data.state;

        if (!state.history["2025-12-19"]) state.history["2025-12-19"] = [];

        const aygunId = "45zvjwn";

        // Remove existing
        state.history["2025-12-19"] = state.history["2025-12-19"].filter(c =>
            !(c.assignedTo === aygunId && c.backupBonus)
        );

        // Add
        state.history["2025-12-19"].push({
            id: `manual-aygun-20251219-${Date.now()}`,
            student: "AYGÜN ÇELİK - Bonus",
            score: 3,
            createdAt: "2025-12-19T12:00:00.000Z",
            assignedTo: aygunId,
            type: "DESTEK",
            isNew: false,
            diagCount: 0,
            isTest: false,
            backupBonus: true,
            assignReason: "Manuel ekleme: +3"
        });

        const { error } = await supabase.from("app_state")
            .update({ state: state, updated_at: new Date().toISOString() })
            .eq("id", "global");

        if (error) { console.error("Error:", error); continue; }

        // Verify
        const { data: vData } = await supabase.from("app_state").select("state").eq("id", "global").single();
        const has = vData.state.history["2025-12-19"]?.some(c => c.assignedTo === aygunId && c.backupBonus);

        if (has) {
            console.log("✅ Verified!");
            success = true;
        }
    }
}
run();
