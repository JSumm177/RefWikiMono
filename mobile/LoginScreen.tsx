import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from './AuthContext';

const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useContext(AuthContext);

    const handleLogin = async () => {
        try {
            // Adjust the URL to match your backend (e.g. your local IP if running on physical device)
            // Use 10.0.2.2 for Android Emulator, localhost for iOS simulator
            const API_URL = 'http://10.0.2.2:8080/api/auth/login';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Platform': 'mobile' // mobile platform requests token in body
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                signIn(data.token);
            } else {
                Alert.alert('Login Failed', data.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Network request failed. Is the server running?');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={styles.buttonContainer}>
                <Button title="Login" onPress={handleLogin} />
            </View>
            <Button title="Don't have an account? Register" onPress={() => navigation.navigate('Register')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    buttonContainer: {
        marginBottom: 10,
    }
});

export default LoginScreen;
