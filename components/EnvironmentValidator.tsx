// ============================================
// RAM Dosya Atama - Environment Validator Component
// Validates environment on app startup
// ============================================

"use client";

import { useEffect, useState } from 'react';

/**
 * Environment Validator Component
 * Validates environment variables on client mount
 * Shows error screen if validation fails
 */
export function EnvironmentValidator({ children }: { children: React.ReactNode }) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Client-side validation
    async function validate() {
      try {
        // Check critical client-side env vars
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error(
            'Missing required Supabase configuration.\n\n' +
            'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
          );
        }

        // Validation passed
        setIsValidating(false);
      } catch (error: any) {
        setValidationError(error.message);
        setIsValidating(false);
      }
    }

    validate();
  }, []);

  // Show loading state during validation
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <div className="text-slate-600">Başlatılıyor...</div>
        </div>
      </div>
    );
  }

  // Show error if validation failed
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">⚠️</div>
            <h1 className="text-2xl font-bold text-slate-900">Yapılandırma Hatası</h1>
          </div>
          <p className="text-slate-600 mb-4">
            Uygulama başlatılamadı. Lütfen sistem yöneticisine başvurun.
          </p>
          <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto max-h-60 font-mono">
            {validationError}
          </pre>
          <div className="mt-4 text-xs text-slate-500">
            Bu hata genellikle eksik environment variables (çevre değişkenleri) nedeniyle oluşur.
            Deployment platformunuzda (Vercel, etc.) gerekli değişkenlerin ayarlandığından emin olun.
          </div>
        </div>
      </div>
    );
  }

  // Validation passed, render children
  return <>{children}</>;
}
