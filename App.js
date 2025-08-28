import React from 'react';
import Routes from '@navigation/Routes';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppToast } from '@components/AppToast';
import { Provider } from 'react-redux';
import { store } from '@redux/store';

const App = () => {
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
