import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Result } from './Result';
// Save data
export const saveData = async (key: string, value: string) => {
    try {
        await AsyncStorage.setItem(key, value);
        return {success:true} as Result<void,string>;
    } catch (e) {
        return {success:false,error:`Failed to save data ${e}`} as Result<void,string>;
    }
};

// Load data
export const loadData = async (key: string) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return {success:true,result:value} as Result<any,string>
    } catch (e) {
        return {success:false,error:` Failed to load data ${e}`} as Result<any,string>
    }
};
