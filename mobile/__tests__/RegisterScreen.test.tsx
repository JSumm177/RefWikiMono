import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('RegisterScreen', () => {
    let mockNavigation: any;

    beforeEach(() => {
        mockNavigation = {
            navigate: jest.fn(),
        };
        global.fetch = jest.fn();
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        // We use getAllByText because there are two 'Register' texts (Title and Button)
        const { getAllByText, getByPlaceholderText, getByText } = render(<RegisterScreen navigation={mockNavigation} />);

        expect(getAllByText('Register').length).toBeGreaterThan(0);
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByText('Already have an account? Login')).toBeTruthy();
    });

    it('handles successful registration', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        const { getByPlaceholderText, getAllByText } = render(<RegisterScreen navigation={mockNavigation} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        // The button has title="Register", and React Native's Button renders a Text element.
        // But there are two 'Register' texts. The second one is likely the button.
        fireEvent.press(getAllByText('Register')[1]);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/register'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
                })
            );
            expect(Alert.alert).toHaveBeenCalledWith(
                'Success',
                'Registration successful. You can now login.',
                expect.any(Array)
            );
        });

        // Simulate pressing OK on the Alert to test navigation
        const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
        const okButton = alertArgs[2][0];
        okButton.onPress();

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });

    it('handles failed registration', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Email already exists' }),
        });

        const { getByPlaceholderText, getAllByText } = render(<RegisterScreen navigation={mockNavigation} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getAllByText('Register')[1]);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Registration Failed', 'Email already exists');
        });
    });

    it('handles network error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getAllByText } = render(<RegisterScreen navigation={mockNavigation} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getAllByText('Register')[1]);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network request failed. Is the server running?');
        });
    });

    it('navigates to Login on link press', () => {
        const { getByText } = render(<RegisterScreen navigation={mockNavigation} />);

        fireEvent.press(getByText('Already have an account? Login'));

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
});
