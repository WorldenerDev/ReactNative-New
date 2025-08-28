// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error(`Error saving data for key "${key}":`, error);
    }
};

export const getItem = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error(`Error reading data for key "${key}":`, error);
        return null;
    }
};

export const removeItem = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing data for key "${key}":`, error);
    }
};

export const clearStorage = async () => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
    }
};
