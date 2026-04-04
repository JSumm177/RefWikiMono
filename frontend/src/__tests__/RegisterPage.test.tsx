import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should display error message on failed registration API call', async () => {
        // Mock global fetch to reject to simulate network error
        const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
        global.fetch = fetchMock;

        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );

        // Fill in the form
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Find the submit button and click it
        const registerButton = screen.getByRole('button', { name: 'Register' });
        fireEvent.click(registerButton);

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
        });

        expect(fetchMock).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
    });
});
