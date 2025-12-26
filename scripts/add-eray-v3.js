// Script: Eray'a 2025-12-19 için 12 puan ekle (upsert ile)
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
        .select("*")
        .eq("id", "global")
        .single();

    if (error) {
        console.error("Okuma hatası:", error);
        return;
    }

    let state = data.state;
    console.log("   Mevcut history anahtarları:", Object.keys(state.history || {}).length);

    // 2. Eray'ı bul
    const eray = state.teachers?.find(t => t.name.includes("ERAY"));
    if (!eray) {
        console.error("Eray bulunamadı!");
        return;
    }
    console.log("2. Eray bulundu:", eray.id);

    // 3. Yeni bonus kayıt
    const newBonus = {
        id: "backup-eray-20251219-v3",
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

    // 4. History'yi düzenle
    const newHistory = JSON.parse(JSON.stringify(state.history || {}));
    if (!newHistory["2025-12-19"]) {
        newHistory["2025-12-19"] = [];
    }
    newHistory["2025-12-19"] = newHistory["2025-12-19"].filter(c =>
        !(c.backupBonus && c.assignedTo === eray.id)
    );
    newHistory["2025-12-19"].push(newBonus);

    console.log("3. 2025-12-19 kayıt sayısı:", newHistory["2025-12-19"].length);

    // 5. Yeni state oluştur
    const newState = {
        ...state,
        history: newHistory,
        updatedAt: new Date().toISOString()
    };

    // 6. UPSERT ile kaydet
    console.log("4. Kaydediliyor...");
    const { data: upsertData, error: upsertError } = await supabase
        .from("app_state")
        .upsert({
            id: "global",
            state: newState,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select();

    if (upsertError) {
        console.error("Upsert hatası:", upsertError);
        return;
    }

    console.log("✅ Upsert başarılı!");

    // 7. Doğrulama
    await new Promise(r => setTimeout(r, 1000)); // 1 saniye bekle
    const { data: verifyData } = await supabase
        .from("app_state")
        .select("state")
        .eq("id", "global")
        .single();

    const dec19 = verifyData?.state?.history?.["2025-12-19"] || [];
    console.log("\n📋 Doğrulama - 2025-12-19 kayıtları (" + dec19.length + " adet):");
    dec19.forEach(c => console.log(`   - ${c.student} | ${c.score} puan`));
}

addErayBackup().catch(console.error);
