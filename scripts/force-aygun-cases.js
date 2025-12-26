// Force add Aygün Dec 19 +3 to CASES (direct injection)
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    let state = data.state;

    const aygunId = "45zvjwn";

    // Add directly to CASES, NO questions asked
    const newBonus = {
        id: `force-add-aygun-${Date.now()}`,
        student: "AYGÜN ÇELİK - Manuel Bonus",
        score: 3,
        createdAt: "2025-12-19T23:59:00.000Z", // Late on the 19th
        assignedTo: aygunId,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Manuel zorla ekleme"
    };

    state.cases.push(newBonus);

    console.log("Forcing +3 into CASES array...");

    const { error } = await supabase.from("app_state")
        .update({ state: state, updated_at: new Date().toISOString() })
        .eq("id", "global");

    if (error) console.error("Error:", error);
    else console.log("✅ FORCED: Added +3 to 'cases' directly. Refresh now.");
})();
