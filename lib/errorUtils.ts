// ============================================
// RAM Dosya Atama - Error Utilities
// Type-safe error handling
// ============================================

/**
 * Type guard to check if value is an Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Get error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return String(error);
}

/**
 * Get error details for logging
 */
export function getErrorDetails(error: unknown): {
  message: string;
  name?: string;
  stack?: string;
  code?: string | number;
} {
  const message = getErrorMessage(error);
  
  if (isError(error)) {
    return {
      message,
      name: error.name,
      stack: error.stack,
      code: 'code' in error ? String(error.code) : undefined,
    };
  }

  if (error && typeof error === 'object') {
    return {
      message,
      code: 'code' in error ? String(error.code) : undefined,
    };
  }

  return { message };
}

/**
 * Safe JSON stringify with error handling
 */
export function safeStringify(value: unknown, fallback: string = '[unstringifiable]'): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}
