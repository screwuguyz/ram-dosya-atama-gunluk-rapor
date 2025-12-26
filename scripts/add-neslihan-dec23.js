// Script: 23.12.2025 Neslihan +2 puan
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    // Neslihan'ı bul
    const teacher = state.teachers?.find(t => t.name.toLowerCase().includes("neslihan"));
    if (!teacher) { console.error("Neslihan bulunamadı"); return; }

    console.log("Öğretmen:", teacher.name, "ID:", teacher.id);

    // 23 Aralık için bonus ekle
    const newBonus = {
        id: "manual-neslihan-20251223-" + Date.now(),
        student: teacher.name + " - Bonus",
        score: 2,
        createdAt: "2025-12-23T12:00:00.000Z",
        assignedTo: teacher.id,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true, // Bonus olarak görünsün
        assignReason: "Manuel ekleme: +2 puan"
    };

    if (!state.history["2025-12-23"]) state.history["2025-12-23"] = [];
    state.history["2025-12-23"].push(newBonus);

    // Kaydet
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
        console.log("✅ Neslihan'a 23.12.2025 için +2 puan eklendi.");
        // Kontrol
        const result = await res.json();
        const recs = result[0]?.state?.history?.["2025-12-23"] || [];
        recs.forEach(c => console.log(`   - ${c.student}: ${c.score}`));
    }
})();
