// ============================================
// RAM Dosya Atama - Production Debug Guard
// Automatically disables console.log and alert in production
// ============================================

"use client";

import { useEffect } from 'react';
import { FeatureFlags } from '@/lib/featureFlags';

/**
 * Production Debug Guard
 * Overrides console.log and alert to prevent debug output in production
 * IMPORTANT: console.error and console.warn are preserved for troubleshooting
 */
export function ProductionDebugGuard() {
  useEffect(() => {
    if (FeatureFlags.PRODUCTION_MODE) {
      // Store original functions
      const originalLog = console.log;
      const originalAlert = window.alert;

      // Override console.log in production (but keep error/warn)
      console.log = (...args: any[]) => {
        // Only log critical messages (errors that were console.log)
        if (args[0]?.includes?.('[ERROR]') || args[0]?.includes?.('CRITICAL')) {
          console.error('[SUPPRESSED LOG]', ...args);
        }
        // Otherwise suppress all console.log
      };

      // Override alert in production - log instead of showing popup
      window.alert = (message?: any) => {
        console.warn('[ALERT SUPPRESSED]', message);
      };

      // Cleanup on unmount (though this component should never unmount)
      return () => {
        console.log = originalLog;
        window.alert = originalAlert;
      };
    }
  }, []);

  return null; // This component renders nothing
}
