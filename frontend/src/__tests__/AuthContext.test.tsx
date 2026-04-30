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
    });

    it('should initialize as not authenticated by default', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
        });
    });

    it('should initialize as authenticated if backend returns ok for /check', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
        });
    });

    it('should catch error when backend /check fails', async () => {
        const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Network error');
        global.fetch = vi.fn().mockRejectedValue(error);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(consoleErrorMock).toHaveBeenCalledWith('Auth check failed:', error);
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
        });
    });

    it('should set authenticated status on login', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
        });

        fireEvent.click(screen.getByText('Login'));

        expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    it('should fetch logout and clear status on logout', async () => {
        // First mock for check, second for logout
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true }) // /check
            .mockResolvedValueOnce({ ok: true }); // /logout
        global.fetch = fetchMock;

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
        });

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
        });
    });

    it('should catch error, log it, and still clear status on failed logout', async () => {
        const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Network error');
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true }) // /check
            .mockRejectedValueOnce(error); // /logout
        global.fetch = fetchMock;

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
        });

        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
            expect(consoleErrorMock).toHaveBeenCalledWith("Logout request failed:", error);
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
        });
    });
});
