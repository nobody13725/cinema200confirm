/**
 * Utility functions for date and time calculations
 */

export function isPastShowtime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const now = new Date();
  const currentYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateStr < currentYMD) return true;
  if (dateStr > currentYMD) return false;
  const currentHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return timeStr <= currentHM;
}

export function formatDateVN(dateStr) {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) {
    // ignore
  }
  return dateStr;
}
