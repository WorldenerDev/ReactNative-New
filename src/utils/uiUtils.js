// utils/device.js
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export const getDeviceType = () => {
  return Platform.OS;
};

export const isIOS = Platform.OS === "ios";

export const isAndroid = Platform.OS === "android";

// Utility function to get Device ID
export const getDeviceId = async () => {
  try {
    const id = await DeviceInfo.getUniqueId();
    return id;
  } catch (error) {
    console.error("Error fetching device ID:", error);
    return null;
  }
};

export function isoDurationToHours(duration) {
  if (!duration) return "N/A";
  // Match hours and minutes
  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  // Convert minutes to hours and add
  return hours + minutes / 60;
}

const ISO_8601_DURATION =
  /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

const formatDurationUnit = (value, singular, plural) => {
  const amount = Number(value);
  if (!amount) return null;
  return `${amount} ${amount === 1 ? singular : plural}`;
};

/**
 * Formats a single ISO 8601 duration per Musement guidelines.
 * Preserves provider units (e.g. PT24H → "24 hours", not "1 day").
 */
export const formatIso8601Duration = (iso) => {
  if (!iso || typeof iso !== "string") return null;
  if (iso === "P0D") return "Flexible";

  const match = iso.match(ISO_8601_DURATION);
  if (!match) return null;

  const [, days, hours, minutes, seconds] = match;
  const parts = [
    formatDurationUnit(days, "day", "days"),
    formatDurationUnit(hours, "hour", "hours"),
    formatDurationUnit(minutes, "minute", "minutes"),
    formatDurationUnit(seconds, "second", "seconds"),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : null;
};

const formatDurationRange = (min, max) => {
  if (min === "P0D" || max === "P0D") {
    return { type: "flexible", text: "Flexible" };
  }

  const minText = min ? formatIso8601Duration(min) : null;
  const maxText = max ? formatIso8601Duration(max) : null;

  if (minText && maxText) {
    if (minText === maxText) {
      return { type: "duration", text: minText };
    }
    return { type: "duration", text: `${minText} – ${maxText}` };
  }
  if (maxText) {
    return { type: "duration", text: `Up to ${maxText}` };
  }
  if (minText) {
    return { type: "duration", text: `At least ${minText}` };
  }
  return null;
};

/**
 * Builds duration/validity display info from activity tour details.
 * Follows Musement duration_range vs validity rules.
 */
export const formatActivityDuration = (tourDetails) => {
  if (!tourDetails) return null;

  const range = tourDetails.durationRange || tourDetails.duration_range;
  if (range?.min || range?.max) {
    return formatDurationRange(range.min, range.max);
  }

  if (tourDetails.validity) {
    if (tourDetails.validity === "P0D") {
      return { type: "flexible", text: "Flexible" };
    }
    const validityText = formatIso8601Duration(tourDetails.validity);
    return validityText
      ? { type: "validity", text: `Valid for ${validityText}` }
      : null;
  }

  const { duration } = tourDetails;
  if (Array.isArray(duration)) {
    if (duration.some((value) => value === "P0D")) {
      return { type: "flexible", text: "Flexible" };
    }
    const [first, second] = duration;
    return formatDurationRange(first || null, second || null);
  }

  if (typeof duration === "string") {
    if (duration === "P0D") {
      return { type: "flexible", text: "Flexible" };
    }
    const text = formatIso8601Duration(duration);
    return text ? { type: "duration", text } : null;
  }

  return null;
};

export const getActivityDurationLabel = (tourDetails) => {
  const durationInfo = formatActivityDuration(tourDetails);
  if (!durationInfo?.text) return "Duration not available";
  if (durationInfo.type === "validity" || durationInfo.type === "flexible") {
    return durationInfo.text;
  }
  return `Duration: ${durationInfo.text}`;
};

export const getConfirmationTimeLabel = (maxConfirmationTime) => {
  if (maxConfirmationTime === "P0D") {
    return "Instant confirmation";
  }
  const duration = formatIso8601Duration(maxConfirmationTime);
  if (duration) {
    return `Confirmed within ${duration}`;
  }
  return "Subject to confirmation";
};
// utils/formattedDate.js
export const formattedDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
