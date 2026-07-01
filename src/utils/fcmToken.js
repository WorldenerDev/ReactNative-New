import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

export const getFCMToken = async () => {
  try {
    if (Platform.OS === "ios") {
      await messaging().registerDeviceForRemoteMessages();
    }

    return await messaging().getToken();
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};
