export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readString(
  source: UnknownRecord,
  keys: string[],
  fallback = "",
) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

export function readNumber(
  source: UnknownRecord,
  keys: string[],
  fallback = 0,
) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return fallback;
}

export function readBoolean(
  source: UnknownRecord,
  keys: string[],
  fallback = false,
) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1" || value === "true") return true;
    if (value === 0 || value === "0" || value === "false") return false;
  }
  return fallback;
}

export function dropUndefined<T extends UnknownRecord>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}
