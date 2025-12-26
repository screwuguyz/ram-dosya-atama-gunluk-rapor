// Script: Neslihan 23.12.2025 +2 Puan (Sebepsiz)
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    // Neslihan ID: ji4xjb9
    const teacherId = "ji4xjb9";
    const teacherName = "NESLİHAN ŞAHİNER";

    // 23 Aralık için bonus
    const newBonus = {
        id: "backup-neslihan-20251223-final",
        student: teacherName + " - Bonus",
        score: 2,
        createdAt: "2025-12-23T12:00:00.000Z",
        assignedTo: teacherId,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Manuel ekleme: sebepsiz +2"
    };

    if (!state.history) state.history = {};
    if (!state.history["2025-12-23"]) state.history["2025-12-23"] = [];

    // Varsa eskisini kaldır (tekrar çalıştırılırsa diye)
    state.history["2025-12-23"] = state.history["2025-12-23"].filter(c =>
        !(c.assignedTo === teacherId && c.backupBonus)
    );

    // Ekle
    state.history["2025-12-23"].push(newBonus);

    console.log("Neslihan'a 23.12.2025 için +2 puan ekleniyor...");

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
        console.log("✅ Başarılı!");
        const result = await res.json();
        const recs = result[0]?.state?.history?.["2025-12-23"] || [];
        recs.forEach(c => console.log(`   - ${c.student}: ${c.score}`));
    } else {
        console.error("Hata:", await res.text());
    }
})();
