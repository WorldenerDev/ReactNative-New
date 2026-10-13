import { NativeModules, Platform } from "react-native";
import { URL } from "@config/api";

const native = NativeModules.SharedAuth;

export async function syncSharedSession(token) {
  if (Platform.OS !== "ios" || !native?.setSession || !token) return;
  try {
    await native.setSession(token, URL);
  } catch (error) {
    console.warn("Unable to share the login with the share sheet", error);
  }
}

export async function clearSharedSession() {
  if (Platform.OS !== "ios" || !native?.clearSession) return;
  try {
    await native.clearSession();
  } catch (error) {
    console.warn("Unable to clear the shared login", error);
  }
}

export async function consumePendingShare() {
  if (Platform.OS !== "ios" || !native?.consumePendingShare) return null;
  try {
    return await native.consumePendingShare();
  } catch (error) {
    return null;
  }
}
