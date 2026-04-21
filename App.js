import React, { useEffect } from "react";
import Routes from "@navigation/Routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppToast } from "@components/AppToast";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import AppStateHandler from "@components/AppStateHandler";
import { StripeProvider } from "@stripe/stripe-react-native";

const STRIPE_PUBLISHABLE_KEY =
  process.env.STRIPE_PUBLISHABLE_KEY;

const App = () => {
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await messaging().setAutoInitEnabled(true);

        if (Platform.OS === "ios") {
          await messaging().registerDeviceForRemoteMessages();
        }

        const authorizationStatus = await messaging().requestPermission();
        const enabled =
          authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          // Permission not granted; FCM token may be unavailable
          return;
        }
      } catch (e) {
        // Swallow to avoid blocking app startup
        console.warn("Firebase messaging initialization failed:", e.message);
      }
    };

    initNotifications();
  }, []);

  return (
    <Provider store={store}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <SafeAreaProvider>
          <AppStateHandler />
          <Routes />
          <AppToast />
        </SafeAreaProvider>
      </StripeProvider>
    </Provider>
  );
};

export default App;
