import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthContext } from '../AuthContext';

describe('LoginPage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should not call fetch when submitting with empty email and password', () => {
        // Mock global fetch
        const fetchMock = vi.fn();
        global.fetch = fetchMock;

        // Mock auth context
        const mockAuthContext = {
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
        };

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        // Find the submit button and click it
        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        // Verify fetch was not called because the form should prevent submission
        // when required fields are empty
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
