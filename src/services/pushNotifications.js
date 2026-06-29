import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import { showPushNotification } from "@components/AppToast";

export const extractNotificationContent = (remoteMessage) => {
  const title =
    remoteMessage?.notification?.title ||
    remoteMessage?.data?.title ||
    "Notification";
  const body =
    remoteMessage?.notification?.body ||
    remoteMessage?.data?.body ||
    remoteMessage?.data?.message ||
    "";

  return { title, body };
};

export const handleForegroundMessage = async (remoteMessage) => {
  const { title, body } = extractNotificationContent(remoteMessage);
  showPushNotification(title, body);
};

export const initializePushNotifications = async () => {
  await messaging().setAutoInitEnabled(true);

  const authorizationStatus = await messaging().requestPermission();
  const enabled =
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    return false;
  }

  if (Platform.OS === "ios") {
    await messaging().registerDeviceForRemoteMessages();
    await messaging().setForegroundPresentationOptions({
      alert: true,
      badge: true,
      sound: true,
    });

    // APNs token must be linked before FCM token is valid on iOS.
    let apnsToken = await messaging().getAPNSToken();
    if (!apnsToken) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      apnsToken = await messaging().getAPNSToken();
    }

    if (!apnsToken) {
      console.warn("APNs token not available yet; push delivery may be delayed on iOS.");
    }
  }

  return enabled;
};

export const subscribeToForegroundMessages = () =>
  messaging().onMessage(handleForegroundMessage);
