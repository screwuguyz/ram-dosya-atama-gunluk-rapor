// Script: Eray bonusunu history'ye ekle
const { createClient } = require("@supabase/supabase-js");

// SSL sertifikası sorunu için
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function fixHistory() {
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

    // Eray'ın backup bonusunu bul
    const erayBonus = state.cases?.find(c =>
        c.backupBonus && c.createdAt?.includes("2024-12-19")
    );

    if (!erayBonus) {
        console.log("❌ Eray bonus cases'da bulunamadı");
        return;
    }

    console.log("✅ Eray bonus bulundu:", erayBonus.student);

    // History'ye ekle
    const history = state.history || {};
    const dec19History = history["2024-12-19"] || [];

    // Zaten history'de var mı kontrol et
    if (dec19History.find(c => c.id === erayBonus.id)) {
        console.log("⚠️ Zaten history'de var");
        return;
    }

    // History'ye ekle
    history["2024-12-19"] = [...dec19History, erayBonus];

    // Cases'dan kaldır (çift sayılmasın diye)
    const newCases = state.cases.filter(c => c.id !== erayBonus.id);

    console.log("📝 History'ye ekleniyor...");

    const { error: updateError } = await supabase
        .from("app_state")
        .upsert({
            id: "global",
            state: {
                ...state,
                cases: newCases,
                history: history,
                updatedAt: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
        });

    if (updateError) {
        console.error("Güncelleme hatası:", updateError);
        return;
    }

    console.log("✅ Başarılı! Eray bonusu history['2024-12-19'] içine taşındı.");
    console.log("   Şimdi günlük raporda 19 Aralık'ta görünmeli!");
}

fixHistory().catch(console.error);
