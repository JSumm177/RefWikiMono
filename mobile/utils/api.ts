import { Platform } from 'react-native';
import { LOCAL_IP } from './ip';

export const getBaseUrl = () => {
    // If we are in development and have a detected IP, use it.
    // Otherwise fall back to simulator defaults.
    if (__DEV__) {
        if (LOCAL_IP && LOCAL_IP !== 'localhost') {
            return `http://${LOCAL_IP}:8080`;
        }
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080';
        }
    }
    return 'http://localhost:8080';
};

export const API_BASE_URL = getBaseUrl();
