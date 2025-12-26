// List ALL cases on 19 Dec
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    // Check Cases
    console.log("--- ALL CASES 2025-12-19 ---");
    state.cases.filter(c => c.createdAt.includes("2025-12-19"))
        .forEach(c => console.log(`[CASE] ${c.student} (${c.assignedTo}) - ${c.score} pts`));

    // Check History
    console.log("\n--- ALL HISTORY 2025-12-19 ---");
    (state.history["2025-12-19"] || [])
        .forEach(c => console.log(`[HIST] ${c.student} (${c.assignedTo}) - ${c.score} pts`));

})();
