// ============================================
// RAM Dosya Atama - Conflict Resolution Modal
// Shows when version conflict detected
// ============================================

"use client";

import { useState } from "react";

interface ConflictData {
  currentVersion: number;
  incomingVersion: number;
  field: string;
  currentValue: any;
  incomingValue: any;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  conflicts: ConflictData[];
  onResolve: (resolution: 'keep-current' | 'use-incoming' | 'merge') => void;
  onCancel: () => void;
}

export function ConflictResolutionModal({
  isOpen,
  conflicts,
  onResolve,
  onCancel,
}: ConflictResolutionModalProps) {
  const [selectedResolution, setSelectedResolution] = useState<'keep-current' | 'use-incoming' | 'merge'>('keep-current');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-500 text-white px-6 py-4">
          <h2 className="text-xl font-bold">⚠️ Senkronizasyon Çakışması</h2>
          <p className="text-sm opacity-90 mt-1">
            Verileriniz sunucudakilerle çakışıyor. Nasıl devam etmek istersiniz?
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Conflict Summary */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Ne Oldu?</h3>
            <p className="text-sm text-yellow-800">
              Başka bir kullanıcı (veya başka bir sekme) aynı anda veri değiştirdi.
              Sizin versiyonunuz: <code className="bg-yellow-200 px-1 rounded">v{conflicts[0]?.incomingVersion || 0}</code>,
              Sunucu versiyonu: <code className="bg-yellow-200 px-1 rounded">v{conflicts[0]?.currentVersion || 0}</code>
            </p>
          </div>

          {/* Resolution Options */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-3">Çözüm Seçenekleri:</h3>

            {/* Option 1: Keep Current */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="resolution"
                value="keep-current"
                checked={selectedResolution === 'keep-current'}
                onChange={(e) => setSelectedResolution(e.target.value as any)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Sunucudaki Veriyi Koru (Önerilen)
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Yaptığınız değişiklikler iptal edilir, sunucudaki güncel veri yüklenir.
                  En güvenli seçenek.
                </div>
              </div>
            </label>

            {/* Option 2: Use Incoming */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-orange-300">
              <input
                type="radio"
                name="resolution"
                value="use-incoming"
                checked={selectedResolution === 'use-incoming'}
                onChange={(e) => setSelectedResolution(e.target.value as any)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Benim Değişikliklerimi Kullan ⚠️
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Sunucudaki veriyi ezecek, sizin yaptığınız değişiklikleri kaydedecek.
                  Diğer kullanıcının değişiklikleri kaybolabilir!
                </div>
              </div>
            </label>

            {/* Option 3: Manual Merge (Future) */}
            <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 opacity-60">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-500">
                    Manuel Birleştirme (Yakında)
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Her alanı tek tek gözden geçirip hangisini kullanacağınıza karar verin.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict Details */}
          {conflicts.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Çakışan Alanlar:</h4>
              <div className="space-y-2">
                {conflicts.map((conflict, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                    <div className="font-medium">{conflict.field}</div>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                      <div>
                        <div className="text-gray-600">Sunucudaki:</div>
                        <code className="text-green-700">{JSON.stringify(conflict.currentValue)}</code>
                      </div>
                      <div>
                        <div className="text-gray-600">Sizinki:</div>
                        <code className="text-blue-700">{JSON.stringify(conflict.incomingValue)}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={() => onResolve(selectedResolution)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedResolution === 'use-incoming'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {selectedResolution === 'keep-current' && 'Sunucudakini Kullan'}
            {selectedResolution === 'use-incoming' && 'Benimkini Kaydet (Riskli)'}
          </button>
        </div>
      </div>
    </div>
  );
}
