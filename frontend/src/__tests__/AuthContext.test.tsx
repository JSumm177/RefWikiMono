import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthContext, AuthProvider } from '../AuthContext';
import { useContext } from 'react';

const TestComponent = () => {
    const { isAuthenticated, login, logout } = useContext(AuthContext);

    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('should initialize as not authenticated by default', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
    });

    it('should initialize as authenticated if localStorage has isAuthenticated=true', () => {
        localStorage.setItem('isAuthenticated', 'true');

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    it('should catch error when failed to load token from localStorage', () => {
        const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage access denied');
        });

        // The try-catch block from the issue is what we're testing.
        // Even though the actual AuthContext doesn't have it around localStorage.getItem right now,
        // we'll update AuthContext.tsx to include the catch block described in the issue.
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // As per the code snippet provided in the issue, it logs "Failed to load token:"
        expect(consoleErrorMock).toHaveBeenCalledWith('Failed to load token:', expect.any(Error));
        expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');

        getItemSpy.mockRestore();
    });

    it('should set authenticated status and localStorage on login', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');

        fireEvent.click(screen.getByText('Login'));

        expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
        expect(localStorage.getItem('isAuthenticated')).toBe('true');
    });

    it('should fetch logout, clear status and localStorage on logout', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = fetchMock;
        localStorage.setItem('isAuthenticated', 'true');

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');

        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Platform': 'web'
                }
            });
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
            expect(localStorage.getItem('isAuthenticated')).toBeNull();
        });
    });

    it('should catch error, log it, and still clear status and localStorage on failed logout', async () => {
        const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Network error');
        const fetchMock = vi.fn().mockRejectedValue(error);
        global.fetch = fetchMock;
        localStorage.setItem('isAuthenticated', 'true');

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');

        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalled();
            expect(consoleErrorMock).toHaveBeenCalledWith("Logout request failed:", error);
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
            expect(localStorage.getItem('isAuthenticated')).toBeNull();
        });
    });
});
