import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data
export const saveData = async (key: string, value: string) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (e) {
        console.error('Failed to save data', e);
    }
};

// Load data
export const loadData = async (key: string) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value !== null ? value : null;
    } catch (e) {
        console.error('Failed to load data', e);
    }
};
