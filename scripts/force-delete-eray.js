// Force delete Eray 19.12.2025
const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = "https://pthxhvjvjzpkwklmzczk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHhodmp2anpwa3drbG16Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwMjYxOCwiZXhwIjoyMDcyNjc4NjE4fQ.q-tPtrMJ_Gi-noCik78_Y_cB87S9jVp_GL-FU8WxGKA";

(async () => {
    const supabase = createClient(url, serviceKey);

    // 1. Get current state
    const { data } = await supabase.from("app_state").select("state").eq("id", "global").single();
    const state = data.state;

    console.log("Current 2025-12-19 count:", state.history["2025-12-19"]?.length || 0);

    // 2. Filter out Eray (assignTo: rnycdxd)
    if (state.history["2025-12-19"]) {
        state.history["2025-12-19"] = state.history["2025-12-19"].filter(c =>
            c.assignedTo !== "rnycdxd"
        );
        // If empty, delete the key? No, keep empty array to be safe
    }

    console.log("New 2025-12-19 count:", state.history["2025-12-19"]?.length || 0);

    // 3. Patch
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
        console.log("✅ Patch successful.");

        // 4. Verify
        const verifyRes = await fetch(`${url}/rest/v1/app_state?id=eq.global&select=state`, {
            headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
        });
        const verifyData = await verifyRes.json();
        const newState = verifyData[0].state;
        const erayCheck = newState.history["2025-12-19"]?.find(c => c.assignedTo === "rnycdxd");

        if (!erayCheck) {
            console.log("✅ Start Verification Passed: Eray is gone from 2025-12-19!");
        } else {
            console.error("❌ Verification Failed: Eray is STILL there!");
        }
    } else {
        console.error("❌ Patch failed:", await res.text());
    }
})();
