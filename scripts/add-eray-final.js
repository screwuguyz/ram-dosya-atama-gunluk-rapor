// Script: Eray'a 2025-12-19 için 12 puan ekle (kesin çalışacak)
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function addErayBackup() {
    const supabase = createClient(url, serviceKey);

    // 1. State'i oku
    console.log("1. State okunuyor...");
    const { data, error } = await supabase
        .from("app_state")
        .select("state")
        .eq("id", "global")
        .single();

    if (error) {
        console.error("Hata:", error);
        return;
    }

    let state = data.state;

    // 2. Eray'ı bul
    const eray = state.teachers?.find(t => t.name.includes("ERAY"));
    if (!eray) {
        console.error("Eray bulunamadı!");
        return;
    }
    console.log("2. Eray bulundu:", eray.name, "ID:", eray.id);

    // 3. Yeni bonus kayıt
    const newBonus = {
        id: "backup-eray-20251219-v2",
        student: "ERAY AHMET TAŞKIN - Başkan Yedek",
        score: 12,
        createdAt: "2025-12-19T23:58:00.000Z",
        assignedTo: eray.id,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Başkan yedek bonusu: 12 puan"
    };

    // 4. History'ye ekle
    if (!state.history) state.history = {};
    if (!state.history["2025-12-19"]) state.history["2025-12-19"] = [];

    // Zaten var mı kontrol et
    const exists = state.history["2025-12-19"].some(c => c.backupBonus && c.assignedTo === eray.id);
    if (exists) {
        console.log("⚠️ Kayıt zaten var, güncelleniyor...");
        state.history["2025-12-19"] = state.history["2025-12-19"].filter(c => !(c.backupBonus && c.assignedTo === eray.id));
    }

    state.history["2025-12-19"].push(newBonus);
    console.log("3. Kayıt eklendi, 2025-12-19 toplam kayıt:", state.history["2025-12-19"].length);

    // 5. Güncelle
    console.log("4. Supabase güncelleniyor...");
    const { error: updateError } = await supabase
        .from("app_state")
        .update({
            state: state,
            updated_at: new Date().toISOString()
        })
        .eq("id", "global");

    if (updateError) {
        console.error("Güncelleme hatası:", updateError);
        return;
    }

    console.log("✅ Başarılı! 2025-12-19'a Eray için 12 puan eklendi.");

    // 6. Doğrulama
    const { data: verifyData } = await supabase
        .from("app_state")
        .select("state")
        .eq("id", "global")
        .single();

    const dec19 = verifyData?.state?.history?.["2025-12-19"] || [];
    console.log("\n✅ Doğrulama - 2025-12-19 kayıtları:");
    dec19.forEach(c => console.log(`   - ${c.student} | ${c.score} puan`));
}

addErayBackup().catch(console.error);
