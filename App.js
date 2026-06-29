import React from "react";
import Routes from "@navigation/Routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppToast } from "@components/AppToast";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import AppStateHandler from "@components/AppStateHandler";
import PushNotificationHandler from "@components/PushNotificationHandler";
import StripeAppBridge from "@components/StripeAppBridge";

const App = () => {
  return (
    <Provider store={store}>
      <StripeAppBridge>
        <SafeAreaProvider>
          <PushNotificationHandler />
          <AppStateHandler />
          <Routes />
          <AppToast />
        </SafeAreaProvider>
      </StripeAppBridge>
    </Provider>
  );
};

export default App;
