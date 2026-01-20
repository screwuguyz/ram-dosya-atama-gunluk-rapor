// Script: State kontrolü
const { createClient } = require("@supabase/supabase-js");

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function checkState() {
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

    // 19 Aralık kayıtlarını göster
    const dec19Cases = (state.cases || []).filter(c =>
        c.createdAt?.includes("2024-12-19")
    );

    console.log("📅 19 Aralık 2024 Kayıtları:");
    dec19Cases.forEach(c => {
        console.log(`  - ${c.student} | Puan: ${c.score} | backupBonus: ${c.backupBonus || false}`);
    });

    // Eray'ın toplam yükünü göster
    const eray = state.teachers?.find(t => t.name.includes("ERAY"));
    if (eray) {
        console.log("\n👤 Eray:", eray.name);
        console.log("   Yıllık Yük:", eray.yearlyLoad);
        console.log("   Aylık:", JSON.stringify(eray.monthly));
    }
}

checkState().catch(console.error);
