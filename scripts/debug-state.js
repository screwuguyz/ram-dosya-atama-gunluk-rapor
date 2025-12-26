// Script: Debug - 2025-12-19 history kontrolü
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function debug() {
    const supabase = createClient(url, serviceKey);

    const { data, error } = await supabase
        .from("app_state")
        .select("state")
        .eq("id", "global")
        .single();

    if (error) {
        console.error("Hata:", error);
        return;
    }

    const state = data.state;

    // History anahtarlarını göster
    console.log("\n📚 History anahtarları:");
    const historyKeys = Object.keys(state.history || {}).sort();
    historyKeys.forEach(key => {
        const count = state.history[key]?.length || 0;
        console.log(`   ${key}: ${count} kayıt`);
    });

    // 2025-12-19 detay
    console.log("\n📅 2025-12-19 kayıtları:");
    const dec19 = state.history?.["2025-12-19"] || [];
    dec19.forEach(c => {
        console.log(`   - ${c.student} | Puan: ${c.score} | assignedTo: ${c.assignedTo}`);
    });

    // Eray'ın tüm kayıtlarını göster
    const eray = state.teachers?.find(t => t.name.includes("ERAY"));
    if (eray) {
        console.log("\n👤 Eray:", eray.name, "ID:", eray.id);
        console.log("   Yıllık Yük:", eray.yearlyLoad);
        console.log("   Aylık:", JSON.stringify(eray.monthly));

        // History'de Eray'a ait tüm kayıtlar
        console.log("\n📊 History'de Eray'a ait tüm kayıtlar:");
        Object.entries(state.history || {}).forEach(([date, cases]) => {
            const erayCases = cases.filter(c => c.assignedTo === eray.id);
            if (erayCases.length > 0) {
                console.log(`   ${date}:`);
                erayCases.forEach(c => console.log(`      - ${c.student} | ${c.score} puan`));
            }
        });
    }
}

debug().catch(console.error);
