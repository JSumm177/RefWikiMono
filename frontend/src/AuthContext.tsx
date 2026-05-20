import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    loginWithProvider: (provider: 'google' | 'apple') => Promise<void>;
    authError: string | null;
    clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    loginWithProvider: async () => {},
    authError: null,
    clearAuthError: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const clearAuthError = () => setAuthError(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check');
                setIsAuthenticated(response.ok);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = () => {
        setIsAuthenticated(true);
    };

    const loginWithProvider = async (provider: 'google' | 'apple') => {
        setAuthError(null);
        try {
            // High-fidelity sandbox delay simulating identity provider OAuth round-trip
            await new Promise((resolve) => setTimeout(resolve, 1200));

            // Production Hooks:
            // For Clerk/Firebase/OAuth, you'd trigger the OAuth flow here. E.g.:
            // await signInWithPopup(auth, googleProvider);
            // OR redirect to Java Servlet OAuth callback:
            // window.location.href = `/api/auth/oauth/${provider}`;

            setIsAuthenticated(true);
        } catch (error) {
            console.error(`${provider} login failed:`, error);
            setAuthError(`Failed to authenticate using ${provider}.`);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Platform': 'web'
                }
            });
            if (!response.ok) {
                setAuthError("Failed to log out cleanly from server.");
            }
        } catch (error) {
            console.error("Logout request failed:", error);
            setAuthError("Network error during logout.");
        } finally {
            setIsAuthenticated(false);
        }
    };

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loginWithProvider, authError, clearAuthError }}>
            {children}
        </AuthContext.Provider>
    );
};
