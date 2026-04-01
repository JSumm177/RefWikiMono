import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
                token = await AsyncStorage.getItem('userToken');
            } catch (e) {
                // Restoring token failed
                console.error("Failed to restore token", e);
            }

            setUserToken(token || null);
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const signIn = async (token: string) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            setUserToken(token);
        } catch (e) {
            console.error("Failed to save token", e);
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
        } catch (e) {
            console.error("Failed to delete token", e);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
