// ============================================
// RAM Dosya Atama - Sync Status Indicator
// ============================================

"use client";

import { SyncStatus } from "@/hooks/useSupabaseSync";

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastError: string | null;
  isConnected: boolean;
}

export function SyncStatusIndicator({
  status,
  lastError,
  isConnected,
}: SyncStatusIndicatorProps) {
  // Don't show anything when idle and connected
  if (status === 'idle' && isConnected && !lastError) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {status === 'syncing' && (
        <div className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Kaydediliyor...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Kaydedildi</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Kayıt hatası</span>
            {lastError && (
              <span className="text-xs opacity-90">{lastError}</span>
            )}
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium">Bağlantı kesildi</span>
        </div>
      )}
    </div>
  );
}
