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
