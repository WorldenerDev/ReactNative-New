import React, { useEffect } from "react";
import {
  initializePushNotifications,
  subscribeToForegroundMessages,
} from "@services/pushNotifications";

const PushNotificationHandler = () => {
  useEffect(() => {
    let unsubscribe = () => {};

    const setup = async () => {
      try {
        await initializePushNotifications();
        unsubscribe = subscribeToForegroundMessages();
      } catch (error) {
        console.warn("Push notification setup failed:", error?.message || error);
      }
    };

    setup();

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
};

export default PushNotificationHandler;
