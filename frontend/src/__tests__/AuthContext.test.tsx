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
    let fetchMock: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        fetchMock = vi.fn().mockResolvedValue({ ok: false });
        global.fetch = fetchMock;
    });

    it('should initialize as not authenticated by default', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
        });
        expect(fetchMock).toHaveBeenCalledWith('/api/auth/check');
    });

    it('should initialize as authenticated if backend check is ok', async () => {
        fetchMock.mockResolvedValueOnce({ ok: true });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
        });
        expect(fetchMock).toHaveBeenCalledWith('/api/auth/check');
    });

    it('should handle fetch error gracefully', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
        });
    });

    it('should set authenticated status on login', async () => {
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

    it('should fetch logout, clear status on logout', async () => {
        fetchMock.mockResolvedValueOnce({ ok: true }); // for /check
        fetchMock.mockResolvedValueOnce({ ok: true }); // for /logout

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
        fetchMock.mockResolvedValueOnce({ ok: true }); // for /check
        fetchMock.mockRejectedValueOnce(error); // for /logout

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
            expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', expect.any(Object));
            expect(consoleErrorMock).toHaveBeenCalledWith("Logout request failed:", error);
            expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
        });
    });
});
