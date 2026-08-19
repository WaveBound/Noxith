// Thin localStorage wrapper used for persisting UI state (open unit tabs, etc.)

const PREFIX = "atd-wiki:";

export function getItem(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Failed to read "${key}" from storage`, e);
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to write "${key}" to storage`, e);
  }
}
