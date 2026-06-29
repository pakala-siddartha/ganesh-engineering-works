/**
 * Format a Date object to YYYY-MM-DD string
 * @param {Date} date
 * @returns {string}
 */
export function formatDateInput(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Format a YYYY-MM-DD string to a human-readable date
 * @param {string} value
 * @returns {string}
 */
export function formatDisplayDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get current month value as YYYY-MM
 * @returns {string}
 */
export function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get today's date as YYYY-MM-DD
 * @returns {string}
 */
export function getTodayString() {
  return formatDateInput(new Date());
}

/**
 * Get a friendly full date string for the header
 * @returns {string}
 */
export function getHeaderDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
