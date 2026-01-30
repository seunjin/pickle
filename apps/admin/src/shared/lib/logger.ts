/**
 * Simple Logger for CSR apps.
 */

const maskPII = (data: unknown): unknown => {
  if (!data) return data;
  if (typeof data !== "object" || data === null) return data;

  const sensitiveKeys = ["password", "token", "key", "secret", "email"];
  const masked = { ...(data as Record<string, unknown>) };

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      masked[key] = "********";
    } else if (typeof masked[key] === "object") {
      masked[key] = maskPII(masked[key]);
    }
  }
  return masked;
};

export const logger = {
  info: (message: string, data?: unknown) => {
    console.info(`[INFO] ${message}`, maskPII(data));
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, maskPII(data));
  },
  error: (message: string, data?: unknown) => {
    console.error(`[ERROR] ${message}`, maskPII(data));
  },
  debug: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, maskPII(data));
    }
  },
};
