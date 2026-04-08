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
import { searchRules, SearchableRule } from './utils/search';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const getControversyColor = (level: number) => {
  switch (level) {
    case 1: return '#4CAF50';
    case 2: return '#8BC34A';
    case 3: return '#FFC107';
    case 4: return '#FF9800';
    case 5: return '#F44336';
    default: return '#ccc';
  }
};

const HomeScreen = () => {
  const { calls } = useContext(CallHistoryContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Call Log</Text>
      {calls.length === 0 ? (
        <Text style={styles.subtitle}>No calls logged yet. Head to Log Call!</Text>
      ) : (
        <FlatList
          data={calls}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderLeftColor: getControversyColor(item.controversyLevel), borderLeftWidth: 6 }]}>
              <Text style={styles.cardTitle}>{item.penaltyName}</Text>
              <Text style={styles.cardSubtitle}>{item.ruleReference}</Text>
              <Text style={styles.cardNotes}>{item.notes}</Text>
              <Text style={styles.cardTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableRule[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setResults(searchRules(text));
    } else {
      setResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search rules (e.g., Holding)"
        value={query}
        onChangeText={handleSearch}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => `${item.ruleId}-${item.sectionId}-${item.articleId}`}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.ruleTitle} - {item.sectionTitle}</Text>
            <Text style={styles.cardSubtitle}>{item.fullReference}</Text>
            <Text style={styles.cardNotes} numberOfLines={3}>{item.articleText}</Text>
          </View>
        )}
      />
    </View>
  );
};

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
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Log Call" component={LogCallScreen} />
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
            options={{ title: 'RefWiki' }} // or headerShown: false if preferred
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
