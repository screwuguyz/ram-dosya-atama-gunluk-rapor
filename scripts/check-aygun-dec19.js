// Check Aygün Dec 19 detail
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    const aygunId = "45zvjwn";
    const date = "2025-12-19";

    console.log(`--- ${date} Analysis for Aygün (ID: ${aygunId}) ---`);

    // 1. History'deki kayıtlar
    const historyRecs = state.history[date]?.filter(c => c.assignedTo === aygunId) || [];
    console.log("\nHistory:");
    historyRecs.forEach(c => console.log(`  - ${c.student}: ${c.score} (Bonus: ${c.backupBonus})`));

    // 2. Cases'daki kayıtlar (eğer varsa)
    const casesRecs = state.cases?.filter(c => c.createdAt?.startsWith(date) && c.assignedTo === aygunId) || [];
    console.log("\nCases:");
    casesRecs.forEach(c => console.log(`  - ${c.student}: ${c.score}`));

    const total = [...historyRecs, ...casesRecs].reduce((sum, c) => sum + c.score, 0);
    console.log(`\nTotal Score: ${total}`);
})();
