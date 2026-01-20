// ============================================
// RAM Dosya Atama - Environment Variable Validation
// Validates all required env vars at startup
// ============================================

/**
 * Required environment variables with descriptions
 */
const REQUIRED_ENV_VARS = {
  // Supabase Configuration (Always Required)
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anon/public key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key (server-side only)',
} as const;

/**
 * Optional environment variables (won't throw error if missing)
 */
const OPTIONAL_ENV_VARS = {
  // Feature Flags
  NEXT_PUBLIC_USE_SEPARATE_QUEUE: 'Queue separation feature flag',
  NEXT_PUBLIC_USE_VERSIONING: 'Versioning feature flag',
  NEXT_PUBLIC_USE_IMPROVED_SYNC: 'Improved sync feature flag',
  NEXT_PUBLIC_USE_TEACHERS_TABLE: 'Teachers table feature flag',
  NEXT_PUBLIC_USE_CASES_TABLE: 'Cases table feature flag',
  NEXT_PUBLIC_USE_HISTORY_TABLE: 'History table feature flag',
  NEXT_PUBLIC_DEBUG_SYNC: 'Debug sync logging flag',
  NEXT_PUBLIC_REQUIRE_ADMIN_AUTH: 'Admin authentication requirement',
  
  // AI Provider (Optional - for explain feature)
  AI_PROVIDER: 'AI provider (openai or groq)',
  OPENAI_API_KEY: 'OpenAI API key',
  OPENAI_MODEL: 'OpenAI model name',
  GROQ_API_KEY: 'Groq API key',
  
  // Pushover (Optional - for notifications)
  PUSHOVER_TOKEN: 'Pushover app token',
  
  // Security (Optional)
  ALLOWED_ORIGINS: 'Allowed CORS origins (comma-separated)',
} as const;

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  missingOptional: string[];
}

/**
 * Validates environment variables
 * @param throwOnError - If true, throws error when required vars are missing (default: true)
 * @returns Validation result
 */
export function validateEnvironment(throwOnError: boolean = true): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  // Check required variables
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, description]) => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missingRequired.push(key);
      errors.push(`Missing required environment variable: ${key} (${description})`);
    }
  });

  // Check optional variables (just warnings)
  Object.entries(OPTIONAL_ENV_VARS).forEach(([key, description]) => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missingOptional.push(key);
      // Only warn about critical optional vars
      if (key.includes('API_KEY')) {
        warnings.push(`Optional: ${key} not set (${description}) - some features may not work`);
      }
    }
  });

  const isValid = errors.length === 0;

  // Throw error if validation failed and throwOnError is true
  if (!isValid && throwOnError) {
    const errorMessage = [
      '❌ ENVIRONMENT VALIDATION FAILED',
      '',
      'Missing required environment variables:',
      ...errors.map(e => `  - ${e}`),
      '',
      'Please set these in your .env file or deployment environment.',
      '',
      'Example .env.local:',
      ...missingRequired.map(key => `${key}=your_value_here`),
    ].join('\n');

    throw new Error(errorMessage);
  }

  return {
    isValid,
    errors,
    warnings,
    missingRequired,
    missingOptional,
  };
}

/**
 * Safe environment getter with fallback
 * @param key - Environment variable key
 * @param fallback - Fallback value if not set
 * @returns Environment variable value or fallback
 */
export function getEnv(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

/**
 * Get required environment variable (throws if missing)
 * @param key - Environment variable key
 * @returns Environment variable value
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please set it in your .env file or deployment environment.`
    );
  }
  return value;
}

/**
 * Logs environment validation results (only in development)
 */
export function logEnvironmentStatus(): void {
  if (process.env.NODE_ENV === 'production') {
    return; // Don't log in production
  }

  const result = validateEnvironment(false); // Don't throw, just check

  console.log('\n=== ENVIRONMENT VALIDATION ===');
  
  if (result.isValid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(e => console.error(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    result.warnings.forEach(w => console.warn(`  - ${w}`));
  }

  if (result.missingOptional.length > 0 && result.missingOptional.length < 5) {
    console.log(`\nℹ️  ${result.missingOptional.length} optional variables not set (this is usually fine)`);
  }

  console.log('==============================\n');
}
