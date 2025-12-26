// Script: 22.12.2025 için Aygün +4, Eray +2 ekle
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function addBonuses() {
    const supabase = createClient(url, serviceKey);

    // 1. State'i oku
    console.log("1. State okunuyor...");
    const { data: currentData } = await supabase
        .from("app_state")
        .select("state")
        .eq("id", "global")
        .single();

    const state = currentData.state;

    // 2. Öğretmenleri bul
    const aygun = state.teachers?.find(t => t.name.toLowerCase().includes("aygün") || t.name.toLowerCase().includes("aygun"));
    const eray = state.teachers?.find(t => t.name.includes("ERAY"));

    console.log("2. Aygün:", aygun?.name, "ID:", aygun?.id);
    console.log("   Eray:", eray?.name, "ID:", eray?.id);

    if (!aygun || !eray) {
        console.error("Öğretmenler bulunamadı!");
        return;
    }

    // 3. Yeni bonus kayıtları
    const aygunBonus = {
        id: "backup-aygun-20251222",
        student: aygun.name + " - Başkan Yedek",
        score: 4,
        createdAt: "2025-12-22T23:58:00.000Z",
        assignedTo: aygun.id,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Başkan yedek bonusu: +4 puan (6→10)"
    };

    const erayBonus = {
        id: "backup-eray-20251222",
        student: eray.name + " - Başkan Yedek",
        score: 2,
        createdAt: "2025-12-22T23:58:00.000Z",
        assignedTo: eray.id,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Başkan yedek bonusu: +2 puan (13→15)"
    };

    // 4. History'ye ekle
    if (!state.history) state.history = {};
    if (!state.history["2025-12-22"]) state.history["2025-12-22"] = [];

    // Eski backup'ları temizle
    state.history["2025-12-22"] = state.history["2025-12-22"].filter(c => !c.backupBonus);

    // Yenileri ekle
    state.history["2025-12-22"].push(aygunBonus);
    state.history["2025-12-22"].push(erayBonus);

    console.log("3. 2025-12-22'ye 2 bonus eklendi");

    // 5. REST API ile kaydet
    const patchResponse = await fetch(`${url}/rest/v1/app_state?id=eq.global`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            state: state,
            updated_at: new Date().toISOString()
        })
    });

    if (patchResponse.ok) {
        const result = await patchResponse.json();
        const dec22 = result[0]?.state?.history?.["2025-12-22"] || [];
        console.log("\n✅ Başarılı! 2025-12-22 kayıtları:");
        dec22.filter(c => c.backupBonus).forEach(c => console.log(`   - ${c.student} | ${c.score} puan`));
    } else {
        console.error("Hata:", await patchResponse.text());
    }
}

addBonuses().catch(console.error);
