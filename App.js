import React, { useEffect } from "react";
import Routes from "@navigation/Routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppToast } from "@components/AppToast";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import firestore from '@react-native-firebase/firestore';

const App = () => {
  useEffect(() => {
    // Test Firebase connection
    const testFirebase = async () => {
      try {
        console.log('🔥 Firebase App initialized successfully!');
        console.log('📊 Firestore instance:', firestore());
        
        // Test a simple Firestore operation
        const testCollection = firestore().collection('test');
        console.log('✅ Firestore collection reference created successfully');
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
      }
    };

    testFirebase();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Routes />
        <AppToast />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
