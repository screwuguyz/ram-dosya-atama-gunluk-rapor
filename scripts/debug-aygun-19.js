// Check Aygün Dec 19 details again
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

    console.log(`--- ${date} Analysis for Aygün ---`);

    // 1. History
    const historyRecs = state.history[date]?.filter(c => c.assignedTo === aygunId) || [];

    // 2. Cases
    const casesRecs = state.cases?.filter(c => c.createdAt?.startsWith(date) && c.assignedTo === aygunId) || [];

    const all = [...historyRecs, ...casesRecs];

    all.forEach(c => {
        console.log(`- Score: ${c.score} | Type: ${c.backupBonus ? 'BONUS' : 'FILE'} | Student: ${c.student}`);
    });

    const total = all.reduce((sum, c) => sum + c.score, 0);
    console.log(`\nTotal: ${total}`);
})();
