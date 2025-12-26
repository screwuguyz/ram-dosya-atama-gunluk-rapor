// Script: Eray bonusunu düzelt - 2025-12-19, 12 puan
const { createClient } = require("@supabase/supabase-js");

// SSL sertifikası sorunu için
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function fixErayBonus() {
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

    // 1. Eski yanlış kaydı sil (history 2024-12-19'dan)
    const history = state.history || {};
    if (history["2024-12-19"]) {
        history["2024-12-19"] = history["2024-12-19"].filter(c => !c.backupBonus);
        if (history["2024-12-19"].length === 0) {
            delete history["2024-12-19"];
        }
        console.log("1. Eski 2024-12-19 kaydı silindi");
    }

    // 2. Eray'ı bul
    const eray = state.teachers?.find(t =>
        t.name.toLowerCase().includes("eray") ||
        t.name.toLowerCase().includes("taşkın")
    );

    if (!eray) {
        console.error("Eray bulunamadı!");
        return;
    }
    console.log("2. Eray bulundu:", eray.name, "ID:", eray.id);

    // 3. Yeni doğru kayıt
    const newBonus = {
        id: "backup-eray-1219-2025",
        student: eray.name + " - Başkan Yedek",
        score: 12, // 12 puan!
        createdAt: "2025-12-19T23:58:00.000Z", // 2025!
        assignedTo: eray.id,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Başkan yedek bonusu: 12 puan"
    };

    // 4. 2025-12-19 history'sine ekle
    if (!history["2025-12-19"]) {
        history["2025-12-19"] = [];
    }
    // Eski varsa sil
    history["2025-12-19"] = history["2025-12-19"].filter(c => !c.backupBonus);
    history["2025-12-19"].push(newBonus);
    console.log("3. Yeni kayıt 2025-12-19'a eklendi:", newBonus.score, "puan");

    // 5. Eray'ın yükünü düzelt (15 çıkar, 12 ekle = -3)
    const updatedTeachers = state.teachers.map(t => {
        if (t.id === eray.id) {
            // Eski yanlış 2024-12 değerini sıfırla, 2025-12'ye 12 ekle
            const monthly = { ...(t.monthly || {}) };
            if (monthly["2024-12"]) {
                monthly["2024-12"] = (monthly["2024-12"] || 0) - 15;
                if (monthly["2024-12"] <= 0) delete monthly["2024-12"];
            }
            monthly["2025-12"] = (monthly["2025-12"] || 0) + 12;

            return {
                ...t,
                yearlyLoad: (t.yearlyLoad || 0) - 15 + 12, // -3 net fark
                monthly
            };
        }
        return t;
    });

    // 6. Güncelle
    const { error: updateError } = await supabase
        .from("app_state")
        .upsert({
            id: "global",
            state: {
                ...state,
                teachers: updatedTeachers,
                history: history,
                updatedAt: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
        });

    if (updateError) {
        console.error("Güncelleme hatası:", updateError);
        return;
    }

    console.log("✅ Başarılı! Eray'a 2025-12-19 için 12 puan başkan yedek bonusu eklendi.");
}

fixErayBonus().catch(console.error);
