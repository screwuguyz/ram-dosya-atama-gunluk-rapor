// Ultimate Force Aygün 19 Dec
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);

    // 1. Get MOST RECENT state
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    let state = data.state;

    // 2. Prepare the bonus case
    const aygunId = "45zvjwn";
    const bonusCase = {
        id: `ultimate-bonus-aygun-${Date.now()}`,
        student: "AYGÜN ÇELİK - BONUS",
        score: 3,
        createdAt: "2025-12-19T14:00:00.000Z", // Mid-day
        assignedTo: aygunId,
        type: "DESTEK", // Standard type
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Final bonus fix"
    };

    // 3. Add to CASES (safer than history for visibility)
    // Check if duplicate exists first
    const exists = state.cases.some(c => c.createdAt.includes("2025-12-19") && c.backupBonus && c.assignedTo === aygunId);
    if (!exists) {
        state.cases.push(bonusCase);
        console.log("Pushing new bonus case...");
    } else {
        console.log("Bonus case already exists in local object (weird, but updating it).");
    }

    // 4. Update with NEW TIMESTAMP
    const { error } = await supabase.from("app_state")
        .update({
            state: state,
            updated_at: new Date(Date.now() + 10000).toISOString() // +10 seconds into future
        })
        .eq("id", "global");

    if (error) {
        console.error("Update failed:", error);
    } else {
        console.log("✅ Update sent!");

        // 5. Verify
        setTimeout(async () => {
            const { data: vData } = await supabase.from("app_state").select("state").eq("id", "global").single();
            const found = vData.state.cases.find(c => c.id === bonusCase.id);
            if (found) console.log("✅ Verified: Data persists in DB.");
            else console.error("❌ Verification Failed: Data lost.");
        }, 2000);
    }
})();
