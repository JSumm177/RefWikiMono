import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { Alert } from 'react-native';
import { AuthContext } from '../AuthContext';

jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
    let mockNavigation: any;
    let mockSignIn: jest.Mock;

    beforeEach(() => {
        mockNavigation = {
            navigate: jest.fn(),
        };
        mockSignIn = jest.fn();
        global.fetch = jest.fn();
        jest.clearAllMocks();
    });

    const renderWithContext = (component: React.ReactElement) => {
        return render(
            <AuthContext.Provider value={{ signIn: mockSignIn, signOut: jest.fn(), userToken: null, isLoading: false }}>
                {component}
            </AuthContext.Provider>
        );
    };

    it('renders correctly', () => {
        const { getAllByText, getByPlaceholderText, getByText } = renderWithContext(<LoginScreen navigation={mockNavigation} />);

        expect(getAllByText('Login').length).toBeGreaterThan(0);
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByText("Don't have an account? Register")).toBeTruthy();
    });

    it('handles successful login', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'fake-jwt-token' }),
        });

        const { getByPlaceholderText, getAllByText } = renderWithContext(<LoginScreen navigation={mockNavigation} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getAllByText('Login')[1]); // The second 'Login' text is typically the button

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/login'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
                })
            );
            expect(mockSignIn).toHaveBeenCalledWith('fake-jwt-token');
        });
    });

    it('handles failed login', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid credentials' }),
        });

        const { getByPlaceholderText, getAllByText } = renderWithContext(<LoginScreen navigation={mockNavigation} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
        fireEvent.press(getAllByText('Login')[1]);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
        });
    });

    it('handles network error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getAllByText } = renderWithContext(<LoginScreen navigation={mockNavigation} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getAllByText('Login')[1]);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network request failed. Is the server running?');
        });
    });

    it('navigates to Register on link press', () => {
        const { getByText } = renderWithContext(<LoginScreen navigation={mockNavigation} />);

        fireEvent.press(getByText("Don't have an account? Register"));

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    });
});
