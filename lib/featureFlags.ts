// ============================================
// RAM Dosya Atama - Feature Flags
// ============================================

/**
 * Feature flags for gradual rollout and safe deployments
 * All flags default to FALSE for backward compatibility
 */

export const FeatureFlags = {
  // Week 1: Queue Separation
  USE_SEPARATE_QUEUE: process.env.NEXT_PUBLIC_USE_SEPARATE_QUEUE === 'true',
  
  // Week 2: Versioning
  USE_VERSIONING: process.env.NEXT_PUBLIC_USE_VERSIONING === 'true',
  
  // Week 3: Improved Sync
  USE_IMPROVED_SYNC: process.env.NEXT_PUBLIC_USE_IMPROVED_SYNC === 'true',
  
  // Week 4+: Teachers Table
  USE_TEACHERS_TABLE: process.env.NEXT_PUBLIC_USE_TEACHERS_TABLE === 'true',
  
  // Week 5+: Cases Table
  USE_CASES_TABLE: process.env.NEXT_PUBLIC_USE_CASES_TABLE === 'true',
  
  // Week 6+: History Table
  USE_HISTORY_TABLE: process.env.NEXT_PUBLIC_USE_HISTORY_TABLE === 'true',
  
  // Debug Mode
  DEBUG_SYNC: process.env.NEXT_PUBLIC_DEBUG_SYNC === 'true',
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[flag];
}

/**
 * Log feature flag status (for debugging)
 */
export function logFeatureFlags() {
  if (typeof window !== 'undefined') {
    console.log('[Feature Flags]', FeatureFlags);
  }
}
