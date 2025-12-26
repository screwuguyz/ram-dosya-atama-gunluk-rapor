// Script: Direkt SQL ile güncelle
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

async function addViaSQL() {
    const supabase = createClient(url, serviceKey);

    // Eray ID
    const erayId = "rnycdxd";

    // Yeni bonus
    const newBonus = {
        id: "backup-eray-20251219-final",
        student: "ERAY AHMET TAŞKIN - Başkan Yedek",
        score: 12,
        createdAt: "2025-12-19T23:58:00.000Z",
        assignedTo: erayId,
        type: "DESTEK",
        isNew: false,
        diagCount: 0,
        isTest: false,
        backupBonus: true,
        assignReason: "Başkan yedek bonusu: 12 puan"
    };

    // Raw SQL ile JSON ekle
    console.log("SQL ile ekleniyor...");

    // jsonb_set kullanarak history'e ekle
    const sqlQuery = `
        UPDATE app_state 
        SET state = jsonb_set(
            state,
            '{history,2025-12-19}',
            COALESCE(state->'history'->'2025-12-19', '[]'::jsonb) || $1::jsonb,
            true
        ),
        updated_at = NOW()
        WHERE id = 'global'
        RETURNING state->'history'->'2025-12-19' as dec19
    `;

    const { data, error } = await supabase.rpc('exec_sql', {
        sql: sqlQuery,
        params: [JSON.stringify(newBonus)]
    });

    if (error) {
        console.log("RPC yok, normal yöntem deneniyor...");

        // Alternatif: fetch ile REST API
        const response = await fetch(`${url}/rest/v1/app_state?id=eq.global`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                state: null // Bu çalışmaz, state'i okuyup değiştirmemiz lazım
            })
        });

        // Başka yaklaşım: Mevcut state'i oku ve tekrar yaz
        const { data: currentData } = await supabase
            .from("app_state")
            .select("state")
            .eq("id", "global")
            .single();

        const state = currentData.state;

        // History'ye ekle
        if (!state.history) state.history = {};
        if (!state.history["2025-12-19"]) state.history["2025-12-19"] = [];

        // Önce eski backup'ları temizle
        state.history["2025-12-19"] = state.history["2025-12-19"].filter(c => !c.backupBonus);
        state.history["2025-12-19"].push(newBonus);

        console.log("Eklenen kayıt:", newBonus.student);
        console.log("2025-12-19 toplam:", state.history["2025-12-19"].length);

        // Sadece history'yi güncelle - tüm state'i değil
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

        const result = await patchResponse.json();
        console.log("PATCH sonuç:", patchResponse.status);

        if (patchResponse.ok) {
            console.log("✅ PATCH başarılı!");
            // Doğrula
            const dec19 = result[0]?.state?.history?.["2025-12-19"] || [];
            console.log("Doğrulama - 2025-12-19:", dec19.length, "kayıt");
            dec19.forEach(c => console.log(`   - ${c.student} | ${c.score}`));
        } else {
            console.error("PATCH hatası:", result);
        }
    }
}

addViaSQL().catch(console.error);
