# RAM Dosya Atama - Migration Plan

## Overview

3-month gradual migration to eliminate sync conflicts and improve reliability.

---

## ✅ Week 1: Queue Separation & Sync Improvements (COMPLETED)

**Branch:** `claude/week1-queue-separation-Yst4w`
**Commits:** 3 commits
**Status:** ✅ Complete, Ready for Testing

### What Was Done

#### 1. Safety Infrastructure
- ✅ Backup & Restore System (`lib/backup.ts`, `/api/backup`)
- ✅ Feature Flags (`lib/featureFlags.ts`)
- ✅ `.env.example` with all flags documented

#### 2. Queue Separation
- ✅ `NEXT_PUBLIC_USE_SEPARATE_QUEUE` flag
- ✅ Queue removed from app_state sync when enabled
- ✅ Backward compatible (works with flag off)

#### 3. Versioning System
- ✅ Version field added to StateShape
- ✅ Conflict detection (409 response)
- ✅ SQL migration script (`supabase/versioning_migration.sql`)

#### 4. Improved Sync
- ✅ Debounce: 1s → 3s (via `NEXT_PUBLIC_USE_IMPROVED_SYNC`)
- ✅ Sync status tracking (idle/syncing/success/error)
- ✅ Retry utilities (`lib/syncUtils.ts`)

#### 5. Loading States
- ✅ SyncStatusIndicator component
- ✅ Visual feedback ("Kaydediliyor...")
- ✅ Error messaging

### Expected Impact
- 🎯 70% reduction in race conditions
- 🎯 Clear user feedback
- 🎯 Reduced server load (3s debounce)

### Testing Instructions

1. **Enable Flags** (Vercel Dashboard):
   ```
   NEXT_PUBLIC_USE_SEPARATE_QUEUE=true
   NEXT_PUBLIC_USE_VERSIONING=true
   NEXT_PUBLIC_USE_IMPROVED_SYNC=true
   ```

2. **Run SQL Migration** (Supabase SQL Editor):
   ```sql
   -- Run: supabase/versioning_migration.sql
   ```

3. **Test Scenarios**:
   - Add new teacher → Watch sync indicator
   - Assign case → Verify 3s delay before sync
   - Simulate conflict → Check 409 response
   - Queue operations → Verify independent of app_state

4. **Rollback** (if issues):
   ```
   NEXT_PUBLIC_USE_SEPARATE_QUEUE=false
   NEXT_PUBLIC_USE_VERSIONING=false
   NEXT_PUBLIC_USE_IMPROVED_SYNC=false
   ```

### Files Changed
```
Modified:
- hooks/useSupabaseSync.ts (versioning, status, improved sync)
- app/api/state/route.ts (conflict detection)

Added:
- lib/backup.ts (backup system)
- lib/featureFlags.ts (feature flags)
- lib/syncUtils.ts (retry utilities)
- components/sync/SyncStatusIndicator.tsx (UI feedback)
- supabase/versioning_migration.sql (database schema)
- .env.example (documentation)
```

---

## 📋 Week 2-4: Teachers Table Migration (PLANNED)

**Goal:** Move teachers from JSONB to dedicated table

### Week 2: Schema & Dual-Write
- Create teachers table with proper schema
- RPC functions for atomicoperations
- Start dual-write mode (both app_state and teachers table)

### Week 3: Read Migration
- Switch reads to teachers table
- Keep app_state as fallback
- Monitor performance

### Week 4: Cleanup
- Remove teachers from app_state
- Optimize queries
- Stabilize

---

## 📋 Week 5-8: Cases Table Migration (PLANNED)

Similar strategy as teachers

---

## 📋 Week 9-12: History Table Migration (PLANNED)

Final major table separation

---

## Feature Flags Reference

| Flag | Default | Purpose |
|------|---------|---------|
| `NEXT_PUBLIC_USE_SEPARATE_QUEUE` | false | Queue in queue_tickets table |
| `NEXT_PUBLIC_USE_VERSIONING` | false | Conflict detection |
| `NEXT_PUBLIC_USE_IMPROVED_SYNC` | false | 3s debounce, retry logic |
| `NEXT_PUBLIC_USE_TEACHERS_TABLE` | false | Teachers in dedicated table |
| `NEXT_PUBLIC_USE_CASES_TABLE` | false | Cases in dedicated table |
| `NEXT_PUBLIC_USE_HISTORY_TABLE` | false | History in dedicated table |

---

## Rollback Strategy

### Instant Rollback (Environment Variables)
1. Vercel Dashboard → Settings → Environment Variables
2. Set problematic flag to `false`
3. Redeploy (or wait for auto-deploy)
4. System reverts to previous behavior

### Git Rollback (Code Level)
```bash
# Go back to previous branch
git checkout claude/organize-file-system-Yst4w
git push -f origin claude/organize-file-system-Yst4w

# Vercel auto-deploys
```

### Database Rollback (If migration applied)
```sql
-- Backup before migration (automatic via app/api/cron/backup)
-- Restore via /api/backup endpoint
```

---

## Success Metrics

### Week 1
- [ ] Zero 409 conflicts in logs
- [ ] Sync indicator shows for all saves
- [ ] Queue operations independent
- [ ] 70% reduction in race conditions

### Week 2-4
- [ ] Teachers CRUD operations 2x faster
- [ ] Zero data loss during migration
- [ ] Rollback tested successfully

---

## Contact & Support

**Questions?** Check:
- Feature flag definitions: `lib/featureFlags.ts`
- Backup system: `lib/backup.ts`
- Sync utilities: `lib/syncUtils.ts`

**Issues?**
1. Check Vercel logs
2. Check Supabase logs
3. Test with flags disabled
4. Contact dev team

---

**Last Updated:** 2026-01-19
**Current Phase:** Week 1 Complete ✅
**Next Milestone:** Week 2 (Teachers Table)
