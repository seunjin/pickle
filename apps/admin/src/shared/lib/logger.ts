/**
 * Simple Logger for CSR apps.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const maskPII = (data: any): any => {
  if (!data) return data;
  const sensitiveKeys = ["password", "token", "key", "secret", "email"];
  const masked = { ...data };
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
  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}`, maskPII(data));
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, maskPII(data));
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, maskPII(data));
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, maskPII(data));
    }
  },
};
