// ============================================
// RAM Dosya Atama - Production-Safe Logger
// Automatically disabled in production
// ============================================

import { FeatureFlags } from './featureFlags';

/**
 * Debug logger that's automatically disabled in production
 * Use this instead of console.log for debug messages
 */
export const logger = {
  /**
   * Debug log - only shows in development
   */
  debug: (...args: any[]) => {
    if (!FeatureFlags.PRODUCTION_MODE && FeatureFlags.DEBUG_SYNC) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info log - shows in development, minimal in production
   */
  info: (...args: any[]) => {
    if (!FeatureFlags.PRODUCTION_MODE) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Warning - always shows (important for troubleshooting)
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error - always shows (critical for troubleshooting)
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Alert replacement - only shows in development
   * In production, logs to console instead of showing alert popup
   */
  alert: (message: string) => {
    if (!FeatureFlags.PRODUCTION_MODE) {
      alert(message);
    } else {
      console.warn('[ALERT SUPPRESSED]', message);
    }
  }
};

/**
 * Legacy support - use logger.debug instead
 * @deprecated Use logger.debug() instead
 */
export const debugLog = logger.debug;
