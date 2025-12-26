// Add Aygün Dec 19 +3 to CASES
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    let state = data.state;

    const aygunId = "45zvjwn";

    // Check if already in cases
    const existing = state.cases.find(c =>
        c.assignedTo === aygunId &&
        c.backupBonus &&
        c.createdAt.startsWith("2025-12-19")
    );

    if (existing) {
        console.log("⚠️ Bonus already in cases!");
    } else {
        const newBonus = {
            id: `manual-aygun-20251219-c-${Date.now()}`,
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
        };

        state.cases.push(newBonus);
        console.log("Adding to CASES...");

        const { error } = await supabase.from("app_state")
            .update({ state: state, updated_at: new Date().toISOString() })
            .eq("id", "global");

        if (error) console.error(error);
        else console.log("✅ Added to Cases successfully.");
    }
})();
