import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        try {
            // Synchronously initialize state from localStorage to prevent flash of unauthenticated state
            const token = localStorage.getItem('isAuthenticated') === 'true';
            if (token) {
                return true;
            }
        } catch (error) {
            console.error('Failed to load token:', error);
        }
        return false;
    });

    const login = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Platform': 'web'
                }
            });
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            localStorage.removeItem('isAuthenticated');
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
