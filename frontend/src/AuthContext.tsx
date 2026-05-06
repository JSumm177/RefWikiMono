import { createContext, useState, useEffect } from 'react';
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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

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
            setIsAuthenticated(false);
        }
    };

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
