// Check Eray 19.12 status
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    const teacherName = "ERAY";

    console.log("--- HISTORY 2025-12-19 ---");
    state.history["2025-12-19"]?.forEach(c => console.log(`  ${c.student} (${c.assignedTo}) - Bonus: ${c.backupBonus}, Score: ${c.score}`));

    console.log("\n--- HISTORY 2024-12-19 ---");
    state.history["2024-12-19"]?.forEach(c => console.log(`  ${c.student} (${c.assignedTo}) - Bonus: ${c.backupBonus}, Score: ${c.score}`));

    console.log("\n--- CASES (created_at includes 12-19) ---");
    state.cases?.filter(c => c.createdAt?.includes("-12-19") && c.student.includes(teacherName))
        .forEach(c => console.log(`  ${c.createdAt}: ${c.student} - Bonus: ${c.backupBonus}, Score: ${c.score}`));

})();
