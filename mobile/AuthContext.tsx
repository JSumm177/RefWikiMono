import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    userToken: string | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    signIn: async () => {},
    signOut: async () => {},
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch the token from storage
        const bootstrapAsync = async () => {
            let token;
            try {
                token = await SecureStore.getItemAsync('userToken');
            } catch (e) {
                // Restoring token failed
                console.error("Failed to restore token", e);
                Alert.alert('Error', 'Failed to restore login session.');
            }

            setUserToken(token || null);
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const signIn = async (token: string) => {
        try {
            await SecureStore.setItemAsync('userToken', token);
            setUserToken(token);
        } catch (e) {
            console.error("Failed to save token", e);
            Alert.alert('Error', 'Failed to save login session.');
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            setUserToken(null);
        } catch (e) {
            console.error("Failed to delete token", e);
            Alert.alert('Error', 'Failed to delete login session.');
            setUserToken(null); // Clear local state anyway
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
