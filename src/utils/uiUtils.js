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
