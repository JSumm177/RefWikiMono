import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { AuthContext } from '../AuthContext';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockSignIn = jest.fn();

const renderLoginScreen = (navigation: any) => {
    return render(
        <AuthContext.Provider value={{ userToken: null, signIn: mockSignIn, signOut: jest.fn(), isLoading: false }}>
            <LoginScreen navigation={navigation} />
        </AuthContext.Provider>
    );
};

describe('LoginScreen', () => {
    let mockNavigation: any;

    beforeEach(() => {
        mockNavigation = {
            navigate: jest.fn(),
        };
        global.fetch = jest.fn();
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getAllByText, getByPlaceholderText } = renderLoginScreen(mockNavigation);

        expect(getAllByText('Login').length).toBeGreaterThan(0);
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('handles successful login', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'test-token' }),
        });

        const { getByPlaceholderText, getAllByText } = renderLoginScreen(mockNavigation);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getAllByText('Login')[1]);

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('test-token');
        });
    });

    it('handles failed login with error message', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid credentials' }),
        });

        const { getByPlaceholderText, getAllByText, findByText } = renderLoginScreen(mockNavigation);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getAllByText('Login')[1]);

        const errorText = await findByText('Invalid credentials');
        expect(errorText).toBeTruthy();
        expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
    });

    it('handles network error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getAllByText, findByText } = renderLoginScreen(mockNavigation);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getAllByText('Login')[1]);

        const errorText = await findByText('Network request failed. Is the server running?');
        expect(errorText).toBeTruthy();
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network request failed. Is the server running?');
    });

    it('navigates to Register on link press', () => {
        const { getByText } = renderLoginScreen(mockNavigation);

        fireEvent.press(getByText('Don\'t have an account? Register'));

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    });
});
