/**
 * Utility functions for date and time calculations
 */

export function getLocalYMD(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function normalizeDateToYMD(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const dmyFull = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyFull) {
    const [, dd, mm, yyyy] = dmyFull;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  const dmyShort = trimmed.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (dmyShort) {
    const [, dd, mm] = dmyShort;
    const yyyy = new Date().getFullYear();
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  return trimmed;
}

export function isPastShowtime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const normalizedDate = normalizeDateToYMD(dateStr);
  const now = new Date();
  const currentYMD = getLocalYMD(0);
  if (normalizedDate < currentYMD) return true;
  if (normalizedDate > currentYMD) return false;
  const currentHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return timeStr <= currentHM;
}

export function formatDateVN(dateStr) {
  if (!dateStr) return "";
  const ymd = normalizeDateToYMD(dateStr);
  const parts = ymd.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

