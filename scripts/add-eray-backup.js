// Script: 19 Aralık için Eray'a Başkan Yedek Bonusu Ekle
const { createClient } = require("@supabase/supabase-js");

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function addBackupBonus() {
    const supabase = createClient(url, serviceKey);

    // 1. Mevcut state'i oku
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

    const state = data.state;
    console.log("   Öğretmen sayısı:", state.teachers?.length);
    console.log("   Dosya sayısı:", state.cases?.length);

    // 2. Eray'ı bul
    const eray = state.teachers?.find(t =>
        t.name.toLowerCase().includes("eray") ||
        t.name.toLowerCase().includes("taşkın")
    );

    if (!eray) {
        console.error("Eray bulunamadı! Öğretmenler:", state.teachers?.map(t => t.name));
        return;
    }
    console.log("2. Eray bulundu:", eray.name, "ID:", eray.id);

    // 3. 19 Aralık'taki en yüksek puanı bul
    const dec19Cases = (state.cases || []).filter(c =>
        c.createdAt?.startsWith("2024-12-19") &&
        !c.backupBonus &&
        !c.absencePenalty
    );
    const maxScore = dec19Cases.length > 0
        ? Math.max(...dec19Cases.map(c => c.score || 0))
        : 10;
    console.log("3. 19 Aralık en yüksek puan:", maxScore);

    // 4. Bonus puanı hesapla (en yüksek + 5, minimum 12)
    const bonusScore = Math.max(maxScore + 5, 12);
    console.log("4. Bonus puan:", bonusScore);

    // 5. Zaten eklenmiş mi kontrol et
    const existing = (state.cases || []).find(c =>
        c.backupBonus &&
        c.createdAt?.startsWith("2024-12-19") &&
        c.assignedTo === eray.id
    );
    if (existing) {
        console.log("⚠️ Bu bonus zaten eklenmiş:", existing);
        return;
    }

    // 6. Yeni bonus case oluştur
    const newCase = {
        id: "backup-eray-1219-" + Date.now(),
        student: eray.name + " - Başkan Yedek",
        score: bonusScore,
        createdAt: "2024-12-19T23:58:00.000Z",
        assignedTo: eray.id,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Başkan yedek bonusu: en yüksek " + maxScore + " + 5 = " + bonusScore
    };
    console.log("5. Yeni kayıt:", newCase);

    // 7. State'i güncelle
    const newCases = [...(state.cases || []), newCase];

    // Eray'ın yıllık yükünü de güncelle
    const updatedTeachers = state.teachers.map(t => {
        if (t.id === eray.id) {
            const ym = "2024-12";
            return {
                ...t,
                yearlyLoad: (t.yearlyLoad || 0) + bonusScore,
                monthly: {
                    ...(t.monthly || {}),
                    [ym]: ((t.monthly || {})[ym] || 0) + bonusScore
                }
            };
        }
        return t;
    });

    const { error: updateError } = await supabase
        .from("app_state")
        .upsert({
            id: "global",
            state: {
                ...state,
                cases: newCases,
                teachers: updatedTeachers,
                updatedAt: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
        });

    if (updateError) {
        console.error("Güncelleme hatası:", updateError);
        return;
    }

    console.log("✅ Başarılı! Eray'a 19 Aralık için", bonusScore, "puan başkan yedek bonusu eklendi.");
}

addBackupBonus().catch(console.error);
