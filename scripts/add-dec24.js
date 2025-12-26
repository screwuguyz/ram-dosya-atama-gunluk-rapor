// Script: 24.12.2025 Aygün ve Nuray +3 Puan
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    // Öğretmen ID'leri
    const aygunId = "45zvjwn"; // Loglardan alındı
    const nurayId = "wttamdj"; // Loglardan alındı

    // 24 Aralık için
    if (!state.history["2025-12-24"]) state.history["2025-12-24"] = [];

    const bonuses = [
        {
            id: `manual-aygun-20251224-${Date.now()}`,
            student: "AYGÜN ÇELİK - Bonus",
            score: 3,
            createdAt: "2025-12-24T12:00:00.000Z",
            assignedTo: aygunId,
            type: "DESTEK",
            isNew: false,
            diagCount: 0,
            isTest: false,
            backupBonus: true,
            assignReason: "Manuel ekleme: +3"
        },
        {
            id: `manual-nuray-20251224-${Date.now()}`,
            student: "NURAY KIZILGÜNEŞ - Bonus",
            score: 3,
            createdAt: "2025-12-24T12:00:00.000Z",
            assignedTo: nurayId,
            type: "DESTEK",
            isNew: false,
            diagCount: 0,
            isTest: false,
            backupBonus: true,
            assignReason: "Manuel ekleme: +3"
        }
    ];

    // Eskileri temizle (duplicate olmasın diye)
    state.history["2025-12-24"] = state.history["2025-12-24"].filter(c =>
        !((c.assignedTo === aygunId || c.assignedTo === nurayId) && c.backupBonus)
    );

    // Ekle
    state.history["2025-12-24"].push(...bonuses);

    console.log("Ekleniyor...");

    const res = await fetch(`${url}/rest/v1/app_state?id=eq.global`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ state, updated_at: new Date().toISOString() })
    });

    if (res.ok) {
        console.log("✅ Başarılı! 24.12.2025:");
        const result = await res.json();
        result[0].state.history["2025-12-24"]
            .filter(c => c.backupBonus)
            .forEach(c => console.log(`  - ${c.student}: ${c.score}`));
    } else {
        console.error("Hata:", await res.text());
    }
})();
