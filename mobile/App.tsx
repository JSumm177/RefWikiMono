import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const Stack = createNativeStackNavigator();

const HomeScreen = () => {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to RefWiki!</Text>
      <Text style={styles.subtitle}>You are successfully logged in.</Text>
      <Button title="Logout" onPress={signOut} />
    </View>
  );
};

const Navigation = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken == null ? (
          // No token found, user isn't signed in
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Sign in' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        ) : (
          // User is signed in
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
});

export default App;
