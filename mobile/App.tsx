import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext, AuthProvider } from './AuthContext';
import { CallHistoryProvider, CallHistoryContext } from './CallHistoryContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import LogCallScreen from './LogCallScreen';

// New Screens and Navigators
import RulebookStack from './RulebookStack';
import PenaltyLookupScreen from './PenaltyLookupScreen';
import HomeScreen from './HomeScreen';
import SearchScreenComponent from './SearchScreenComponent';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SettingsScreen = () => {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage your preferences.</Text>
      <Button title="Logout" onPress={signOut} />
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'TV Mode' }} />
      <Tab.Screen name="RulebookTab" component={RulebookStack} options={{ title: 'Rulebook', headerShown: false }} />
      <Tab.Screen name="PenaltyLookup" component={PenaltyLookupScreen} options={{ title: 'Lookup' }} />
      <Tab.Screen name="Search" component={SearchScreenComponent} options={{ title: 'Search' }} />
      <Tab.Screen name="Log Call" component={LogCallScreen} options={{ title: 'Log Call' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
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
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <CallHistoryProvider>
        <Navigation />
      </CallHistoryProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  list: {
    width: '100%',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  cardNotes: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  cardTime: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    width: '100%',
    marginBottom: 15,
    marginTop: 20,
  },
});

export default App;
