// Check Dec 24 status carefully
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    console.log("--- HISTORY 2025-12-24 ---");
    if (state.history["2025-12-24"]) {
        const dec24 = state.history["2025-12-24"];
        console.log(`Count: ${dec24.length}`);
        dec24.forEach(c =>
            console.log(`  ${c.student} (assignedTo: ${c.assignedTo}) - Bonus: ${c.backupBonus}, Score: ${c.score}`)
        );
    } else {
        console.log("  (No entry for 2025-12-24)");
    }
})();
