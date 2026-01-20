# RAM Dosya Atama - Deployment Guide

## 🎯 CURRENT STATUS

**Branch:** `claude/week1-queue-separation-Yst4w`
**Status:** ✅ All migration code complete and tested
**Safety:** ✅ All features behind flags (OFF by default)

---

## 📦 WHAT'S IN THIS BRANCH

### Infrastructure (Week 1)
- ✅ Backup & Restore system
- ✅ Feature flag system
- ✅ Versioning & conflict detection
- ✅ Improved sync (3s debounce, retry)
- ✅ Loading states UI

### Database Migrations (Week 2-12)
- ✅ Teachers table + API
- ✅ Cases table + API
- ✅ History table (partitioned)
- ✅ All RPC functions
- ✅ Conflict resolution UI

**Total Files:** 15 new files, 8 modified files

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Vercel Configuration

**Option A: Use Current Branch as Production** (Recommended)
```
1. Go to Vercel Dashboard
2. Settings → Git
3. Production Branch: claude/week1-queue-separation-Yst4w
4. Save
```

**Option B: Merge to Main** (If you have main access)
```bash
# On GitHub web interface:
1. Create Pull Request
2. Merge claude/week1-queue-separation-Yst4w → main
3. Vercel auto-deploys
```

---

### Step 2: Environment Variables

**Set in Vercel Dashboard (Environment Variables):**

```bash
# Required (already exist)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# NEW FLAGS (All set to FALSE initially)
NEXT_PUBLIC_USE_SEPARATE_QUEUE=false
NEXT_PUBLIC_USE_VERSIONING=false
NEXT_PUBLIC_USE_IMPROVED_SYNC=false
NEXT_PUBLIC_USE_TEACHERS_TABLE=false
NEXT_PUBLIC_USE_CASES_TABLE=false
NEXT_PUBLIC_USE_HISTORY_TABLE=false
NEXT_PUBLIC_DEBUG_SYNC=false
```

**Important:** Deploy with ALL flags = `false` first!

---

### Step 3: Deploy

```
1. Vercel will auto-deploy the branch
2. Wait for build to complete
3. Test production URL
4. Verify old features still work
```

**Expected:** Everything works exactly as before (flags are OFF)

---

## 🧪 TESTING PLAN (After Deployment)

### Phase 1: Week 1 Features (Safe)

**1. Enable Improved Sync:**
```bash
NEXT_PUBLIC_USE_IMPROVED_SYNC=true
```
**Test:**
- Add teacher → See "Kaydediliyor..." message
- Wait 3 seconds → See "Kaydedildi"
- Check logs for sync activity

**2. Enable Versioning:**
```bash
NEXT_PUBLIC_USE_VERSIONING=true
```
**Test:**
- Open 2 tabs
- Edit same teacher in both
- Save in tab 1 → Success
- Save in tab 2 → Should show conflict modal

**3. Enable Queue Separation:**
```bash
NEXT_PUBLIC_USE_SEPARATE_QUEUE=true
```
**Test:**
- Add queue ticket
- Verify it appears
- Check app_state (should NOT include queue)

---

### Phase 2: Database Migrations (Requires SQL)

**Before enabling table flags, run SQL migrations:**

**1. Run in Supabase SQL Editor:**
```sql
-- Run these files in order:
1. supabase/versioning_migration.sql
2. supabase/teachers_table_migration.sql
3. supabase/cases_table_migration.sql
4. supabase/history_table_migration.sql
```

**2. Verify migrations:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('teachers', 'cases', 'history');

-- Should return 3 rows
```

**3. Enable Teachers Table:**
```bash
NEXT_PUBLIC_USE_TEACHERS_TABLE=true
```
**Test:**
- View teachers → Should load from new table
- Add teacher → Should save to new table
- Check Supabase: teachers table should have data

**4. Enable Cases Table:**
```bash
NEXT_PUBLIC_USE_CASES_TABLE=true
```

**5. Enable History Table:**
```bash
NEXT_PUBLIC_USE_HISTORY_TABLE=true
```

---

## 🆘 ROLLBACK PROCEDURE

### Instant Rollback (Environment Variables)

**If anything breaks:**
```
1. Go to Vercel Dashboard
2. Environment Variables
3. Set problematic flag to "false"
4. Wait 1 minute for redeploy
```

**System automatically reverts to old behavior.**

---

### Full Rollback (Git)

**If deployment itself fails:**
```
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"
```

**Or via Git:**
```bash
# Revert to previous commit
git revert <commit-hash>
git push
```

---

## 📊 MONITORING

### What to Watch

**After each flag enable:**
- ✅ Vercel logs (no errors)
- ✅ Supabase logs (no failed queries)
- ✅ User reports (no complaints)
- ✅ Performance metrics

**Red Flags:**
- 🔴 500 errors in Vercel logs
- 🔴 Supabase query failures
- 🔴 User reports of lost data
- 🔴 Slower page loads

**Action:** Immediately disable the flag

---

## 🎓 RECOMMENDED ROLLOUT SCHEDULE

### Week 1 (Low Risk)
```
Day 1: Deploy with all flags OFF
Day 2: Enable USE_IMPROVED_SYNC (3s debounce)
Day 3: Monitor, enable USE_VERSIONING
Day 4-7: Monitor
```

### Week 2 (Medium Risk)
```
Day 1: Run versioning_migration.sql
Day 2: Test in Supabase
Day 3: Enable USE_SEPARATE_QUEUE
Day 4-7: Monitor queue operations
```

### Week 3-4 (High Risk - Database)
```
Week 3 Day 1: Run teachers_table_migration.sql
Week 3 Day 2-3: Verify migration
Week 3 Day 4: Enable USE_TEACHERS_TABLE
Week 3 Day 5-7: Monitor closely
Week 4: Stabilize, fix issues
```

### Week 5-8: Cases Table
### Week 9-12: History Table

---

## ✅ SUCCESS CRITERIA

### Week 1
- [ ] Sync indicator shows on saves
- [ ] No increase in errors
- [ ] 3s debounce working
- [ ] Version conflicts detected

### Week 2-4
- [ ] Teachers table populated
- [ ] CRUD operations faster
- [ ] No data loss
- [ ] Foreign keys working

### Week 5-12
- [ ] All tables migrated
- [ ] 10x faster queries
- [ ] Zero race conditions
- [ ] Happy users!

---

## 📞 SUPPORT

**Issues?**
1. Check Vercel logs
2. Check Supabase logs
3. Check feature flag status
4. Disable problematic flag
5. Contact dev team

**Emergency Rollback:**
Set ALL flags to `false`, system reverts completely.

---

## 🎉 FINAL NOTES

**This migration is:**
- ✅ Fully tested
- ✅ Backward compatible
- ✅ Feature-flagged
- ✅ Reversible
- ✅ Well documented

**You control the pace with flags.**

Good luck! 🚀
