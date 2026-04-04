import React, { useContext } from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, View, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, AuthContext } from '../AuthContext';

// Create a test component that consumes the context
const TestComponent = () => {
    const { userToken, isLoading, signIn, signOut } = useContext(AuthContext);

    return (
        <View>
            <Text testID="userToken">{userToken === null ? 'null' : userToken}</Text>
            <Text testID="isLoading">{isLoading ? 'true' : 'false'}</Text>
            <Button title="Sign In" onPress={() => signIn('dummy-token')} testID="signInButton" />
            <Button title="Sign Out" onPress={() => signOut()} testID="signOutButton" />
        </View>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes with a token from SecureStore if available', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-token');

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for the async bootstrap
        await waitFor(() => {
            expect(getByTestId('isLoading').props.children).toBe('false');
        });

        expect(getByTestId('userToken').props.children).toBe('stored-token');
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('userToken');
    });

    it('initializes with null if no token in SecureStore', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for the async bootstrap
        await waitFor(() => {
            expect(getByTestId('isLoading').props.children).toBe('false');
        });

        expect(getByTestId('userToken').props.children).toBe('null');
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('userToken');
    });

    it('signIn saves the token and updates the state', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for the async bootstrap to finish
        await waitFor(() => {
            expect(getByTestId('isLoading').props.children).toBe('false');
        });

        // Press sign in
        await act(async () => {
            fireEvent.press(getByTestId('signInButton'));
        });

        expect(getByTestId('userToken').props.children).toBe('dummy-token');
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userToken', 'dummy-token');
    });

    it('signOut removes the token and updates the state', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-token');

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for the async bootstrap to finish
        await waitFor(() => {
            expect(getByTestId('isLoading').props.children).toBe('false');
            expect(getByTestId('userToken').props.children).toBe('stored-token');
        });

        // Press sign out
        await act(async () => {
            fireEvent.press(getByTestId('signOutButton'));
        });

        expect(getByTestId('userToken').props.children).toBe('null');
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
    });
});
