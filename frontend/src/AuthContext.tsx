import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    authError: string | null;
    clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
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
        <AuthContext.Provider value={{ isAuthenticated, login, logout, authError, clearAuthError }}>
            {children}
        </AuthContext.Provider>
    );
};
