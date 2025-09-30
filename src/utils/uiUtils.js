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
