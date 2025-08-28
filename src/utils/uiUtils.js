// utils/device.js
import { Platform } from 'react-native';

export const getDeviceType = () => {
    return Platform.OS;
};

export const isIOS = Platform.OS === 'ios';

export const isAndroid = Platform.OS === 'android';
