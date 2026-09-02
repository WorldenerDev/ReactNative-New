/**
 * Normalize a date-like value to YYYY-MM-DD for comparisons / calendars.
 */
export const toYmd = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

/**
 * Shared date formatting for tab screens (Groups, Trips, Booking).
 * Format: "Jun 4, 2026"
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format a date range with en-dash separator.
 * Format: "Jun 4, 2026 – Jun 30, 2026"
 */
export const formatDateRange = (startDate, endDate) => {
  const start = formatDisplayDate(startDate);
  const end = formatDisplayDate(endDate);
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
};

/**
 * Compact range for trip cards. Format: "5 Jun – 9 Jun 2026"
 */
export const formatCompactDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "";
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return formatDateRange(startDate, endDate);
  }

  const formatPart = (date) => ({
    day: date.getDate(),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    year: date.getFullYear(),
  });

  const startPart = formatPart(start);
  const endPart = formatPart(end);

  if (startPart.year === endPart.year && startPart.month === endPart.month) {
    return `${startPart.day} ${startPart.month} – ${endPart.day} ${endPart.month} ${endPart.year}`;
  }

  if (startPart.year === endPart.year) {
    return `${startPart.day} ${startPart.month} – ${endPart.day} ${endPart.month} ${endPart.year}`;
  }

  return `${startPart.day} ${startPart.month} ${startPart.year} – ${endPart.day} ${endPart.month} ${endPart.year}`;
};

/**
 * Activity listing date/time. Uses the calendar day from the ISO prefix so
 * UTC midnight does not shift the date, and only shows a clock time when one
 * is actually stored.
 * Format: "Mar 11" or "Mar 11 · 2:30 PM"
 */
export const formatActivityDateTime = (value) => {
  if (!value) return "";
  const raw = String(value);
  const ymd = toYmd(value);
  if (!ymd) return raw;

  const [year, month, day] = ymd.split("-").map(Number);
  const dateLabel = new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const timeMatch = raw.match(/T(\d{2}):(\d{2})/);
  if (!timeMatch) return dateLabel;

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (!hours && !minutes) return dateLabel;

  const timeLabel = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit" }
  );
  return `${dateLabel} · ${timeLabel}`;
};
