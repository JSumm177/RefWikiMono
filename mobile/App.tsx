import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext, AuthProvider } from './AuthContext';
import { CallHistoryProvider, CallHistoryContext } from './CallHistoryContext';
import { BookmarkProvider, BookmarkContext } from './BookmarkContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import LogCallScreen from './LogCallScreen';
import RuleDetailScreen from './RuleDetailScreen';
import CallDetailScreen from './CallDetailScreen';
import CommunityFeed from './CommunityFeed';
import LeaderboardScreen from './LeaderboardScreen';
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

const HomeScreen = ({ navigation }: any) => {
  const { calls } = useContext(CallHistoryContext);
  const { bookmarks, removeBookmark, isPending } = useContext(BookmarkContext);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.title}>Starred Rules</Text>
        {bookmarks.length === 0 ? (
          <Text style={styles.subtitle}>You haven't starred any rules yet.</Text>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => `${item.sport}-${item.fullReference}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.starredRow}
                onPress={() => {
                  if (item.articleId) {
                    navigation.navigate('RuleDetail', { id: item.articleId });
                  } else {
                    navigation.navigate('Search', { query: item.fullReference, sport: item.sport });
                  }
                }}
              >
                <Text style={{ flex: 1 }}>{item.fullReference} ({item.sport})</Text>
                <TouchableOpacity onPress={() => removeBookmark(item.sport, item.fullReference)} disabled={isPending(item.fullReference)}>
                  {isPending(item.fullReference) ? (
                    <ActivityIndicator size="small" color="#FFC107" />
                  ) : (
                    <Text style={styles.bookmarkActive}>★</Text>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Live Call Log</Text>
        {calls.length === 0 ? (
          <Text style={styles.subtitle}>No calls logged yet. Head to Log Call!</Text>
        ) : (
          <FlatList
            data={calls}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, { borderLeftColor: getControversyColor(item.controversyLevel), borderLeftWidth: 6 }]}
                disabled={!item.isPublic}
                onPress={() => navigation.navigate('CallDetail', { id: item.id })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={styles.cardTitle}>{item.penaltyName} {item.isPublic && <Text style={{ fontSize: 10, color: '#007BFF' }}>(PUBLIC)</Text>}</Text>
                    <Text style={styles.tag}>{item.sport} {item.team ? `• ${item.team}` : ''}</Text>
                </View>
                <Text style={styles.cardSubtitle}>{item.ruleReference}</Text>
                <Text style={styles.cardNotes}>{item.notes}</Text>
                <Text style={styles.cardTime}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('NFL');
  const [results, setResults] = useState<SearchableRule[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setIsSearching(true);
        const data = await searchRules(sport, query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, sport]);

  const toggleBookmark = (item: SearchableRule) => {
    if (isPending(item.fullReference)) return;
    if (isBookmarked(item.sport, item.fullReference)) {
      removeBookmark(item.sport, item.fullReference);
    } else {
      addBookmark(item.sport, item.fullReference, item.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.sportSelector}>
            {['NFL', 'NCAA', 'NBA', 'MLB', 'NHL', 'MLS'].map((s) => (
                <TouchableOpacity
                    key={s}
                    onPress={() => setSport(s)}
                    style={[styles.sportButton, sport === s && styles.sportButtonActive]}
                >
                    <Text style={[styles.sportButtonText, sport === s && styles.sportButtonTextActive]}>
                        {s === 'MLS' ? 'MLS (Soccer)' : s}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
        <TextInput
            style={styles.searchInput}
            placeholder={`Search ${sport}...`}
            value={query}
            onChangeText={setQuery}
        />
      </View>

      {isSearching && <ActivityIndicator size="small" color="#007BFF" style={{ marginBottom: 10 }} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('RuleDetail', { id: item.id })}
              >
                <Text style={styles.cardTitle}>{item.ruleTitle} - {item.sectionTitle}</Text>
                <Text style={styles.cardSubtitle}>{item.fullReference}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleBookmark(item)} disabled={isPending(item.fullReference)}>
                {isPending(item.fullReference) ? (
                    <ActivityIndicator size="small" color="#FFC107" style={{ padding: 5 }} />
                ) : (
                    <Text style={[styles.bookmarkIcon, isBookmarked(item.sport, item.fullReference) && styles.bookmarkActive]}>
                    {isBookmarked(item.sport, item.fullReference) ? '★' : '☆'}
                    </Text>
                )}
              </TouchableOpacity>
            </View>
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
      <Tab.Screen name="Community" component={CommunityFeed} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
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
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ title: 'RefWiki' }}
            />
            <Stack.Screen
              name="RuleDetail"
              component={RuleDetailScreen}
              options={{ title: 'Rule Details' }}
            />
            <Stack.Screen
              name="CallDetail"
              component={CallDetailScreen}
              options={{ title: 'Call Analysis' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <CallHistoryProvider>
          <Navigation />
        </CallHistoryProvider>
      </BookmarkProvider>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
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
  searchHeader: {
    marginTop: 20,
    marginBottom: 15,
  },
  sportSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  sportButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sportButtonActive: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  sportButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sportButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  bookmarkIcon: {
    fontSize: 24,
    color: '#ccc',
    padding: 5,
  },
  bookmarkActive: {
    color: '#FFC107',
    fontSize: 24,
  },
  starredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  tag: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  }
});

export default App;
