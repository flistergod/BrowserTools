/** Shared formatting helpers. Backend dates are milliseconds since Unix epoch. */
export const DAY = 24 * 60 * 60 * 1000;

export function formatDate(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(timestamp);
}

export function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(timestamp);
}

export function domain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function isToday(timestamp) {
  return new Date(timestamp).toDateString() === new Date().toDateString();
}
