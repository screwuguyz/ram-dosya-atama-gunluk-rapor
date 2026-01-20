// ============================================
// RAM Dosya Atama - Error Handler
// ============================================

/**
 * API çağrısı sonucu
 */
export type ApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Güvenli API çağrısı wrapper
 * Hataları yakalar ve yapılandırılmış sonuç döndürür
 */
export async function safeApiCall<T>(
    fn: () => Promise<T>,
    options?: {
        fallback?: T;
        errorMessage?: string;
        logError?: boolean;
    }
): Promise<ApiResult<T>> {
    try {
        const data = await fn();
        return { success: true, data };
    } catch (error) {
        const errorMessage =
            options?.errorMessage ||
            (error instanceof Error ? error.message : "Bilinmeyen hata");

        if (options?.logError !== false) {
            console.error("[API Error]", errorMessage, error);
        }

        if (options?.fallback !== undefined) {
            return { success: true, data: options.fallback };
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Fetch wrapper with error handling
 */
export async function safeFetch<T>(
    url: string,
    options?: RequestInit & {
        fallback?: T;
        parseJson?: boolean;
    }
): Promise<ApiResult<T>> {
    return safeApiCall(async () => {
        const res = await fetch(url, options);

        if (!res.ok) {
            const errorBody = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}: ${errorBody || res.statusText}`);
        }

        if (options?.parseJson === false) {
            return res as unknown as T;
        }

        return res.json();
    }, { fallback: options?.fallback });
}

/**
 * Try-catch wrapper for synchronous operations
 */
export function safeExecute<T>(
    fn: () => T,
    fallback: T
): T {
    try {
        return fn();
    } catch (error) {
        console.error("[Execution Error]", error);
        return fallback;
    }
}

/**
 * LocalStorage wrapper with error handling
 */
export const safeStorage = {
    get<T>(key: string, fallback: T): T {
        if (typeof window === "undefined") return fallback;
        try {
            const item = localStorage.getItem(key);
            if (item === null) return fallback;
            return JSON.parse(item) as T;
        } catch {
            return fallback;
        }
    },

    set<T>(key: string, value: T): boolean {
        if (typeof window === "undefined") return false;
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("[Storage Error]", error);
            return false;
        }
    },

    remove(key: string): boolean {
        if (typeof window === "undefined") return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },

    getString(key: string, fallback: string = ""): string {
        if (typeof window === "undefined") return fallback;
        try {
            return localStorage.getItem(key) || fallback;
        } catch {
            return fallback;
        }
    },

    setString(key: string, value: string): boolean {
        if (typeof window === "undefined") return false;
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    },
};

/**
 * Validate required environment variables
 */
export function validateEnv(required: string[]): { valid: boolean; missing: string[] } {
    const missing = required.filter((key) => !process.env[key]);
    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * Format error for user display
 */
export function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "Beklenmeyen bir hata oluştu";
}

/**
 * Create error with context
 */
export function createError(message: string, context?: Record<string, unknown>): Error {
    const error = new Error(message);
    if (context) {
        (error as Error & { context?: Record<string, unknown> }).context = context;
    }
    return error;
}
