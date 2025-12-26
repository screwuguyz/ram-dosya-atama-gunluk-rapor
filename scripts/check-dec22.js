// Script: 22 Aralık kontrolü
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function check22() {
    const supabase = createClient(url, serviceKey);

    const { data } = await supabase
        .from("app_state")
        .select("state")
        .eq("id", "global")
        .single();

    const state = data.state;

    console.log("📅 2025-12-22 History'de mi?", !!state.history?.["2025-12-22"]);

    if (state.history?.["2025-12-22"]) {
        console.log("\n📚 History 2025-12-22:");
        state.history["2025-12-22"].forEach(c => {
            console.log(`   - ${c.student} | ${c.score} puan | assignedTo: ${c.assignedTo}`);
        });
    }

    // Cases'da 22 Aralık var mı?
    const dec22Cases = (state.cases || []).filter(c => c.createdAt?.includes("2025-12-22"));
    if (dec22Cases.length > 0) {
        console.log("\n📋 Cases 2025-12-22:");
        dec22Cases.forEach(c => {
            console.log(`   - ${c.student} | ${c.score} puan | assignedTo: ${c.assignedTo}`);
        });
    }

    // Eray ID
    const eray = state.teachers?.find(t => t.name.includes("ERAY"));
    console.log("\n👤 Eray ID:", eray?.id);

    // History anahtarları
    console.log("\n📚 Tüm history anahtarları:", Object.keys(state.history || {}).sort().join(", "));
}

check22().catch(console.error);
