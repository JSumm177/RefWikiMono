import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from './utils/api';

interface CommunityCall {
  id: number;
  sport: string;
  team: string;
  penaltyName: string;
  ruleReference: string;
  userName: string;
  userRole: string;
  averageRating: number;
  voteCount: number;
}

interface UserAccuracy {
  userId: number;
  userName: string;
  roleType: string;
  accuracyRate: number;
  totalActions: number;
}

const getControversyColor = (level: number) => {
    switch (Math.round(level)) {
        case 1: return '#4CAF50';
        case 2: return '#8BC34A';
        case 3: return '#FFC107';
        case 4: return '#FF9800';
        case 5: return '#F44336';
        default: return '#ccc';
    }
};

const getAccuracyColor = (rate: number) => {
    if (rate >= 90) return '#4CAF50';
    if (rate >= 75) return '#8BC34A';
    if (rate >= 60) return '#FFC107';
    return '#F44336';
};

const LeaderboardScreen = ({ navigation }: any) => {
  const [calls, setCalls] = useState<CommunityCall[]>([]);
  const [accuracyList, setAccuracyList] = useState<UserAccuracy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'shame' | 'accuracy'>('shame');

  const fetchLeaderboards = async () => {
    setIsLoading(true);
    try {
      const [shameRes, accRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/leaderboard/`),
        fetch(`${API_BASE_URL}/api/leaderboard/accuracy`)
      ]);

      if (shameRes.ok) setCalls(await shameRes.json());
      if (accRes.ok) setAccuracyList(await accRes.json());
    } catch (error) {
      console.error('Failed to fetch leaderboards', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'shame' && styles.activeTab]}
          onPress={() => setTab('shame')}
        >
          <Text style={[styles.tabText, tab === 'shame' && styles.activeTabText]}>🔥 Shame</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'accuracy' && styles.activeTab]}
          onPress={() => setTab('accuracy')}
        >
          <Text style={[styles.tabText, tab === 'accuracy' && styles.activeTabText]}>🎯 Accuracy</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>
        {tab === 'shame' ? '🔥 Hall of Shame' : '🎯 Accuracy Kings'}
      </Text>
      <Text style={styles.subHeader}>
        {tab === 'shame'
          ? 'Most controversial community-rated calls'
          : 'Users most aligned with community consensus'}
      </Text>

      {tab === 'shame' ? (
        <FlatList
          data={calls}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CallDetail', { id: item.id })}
            >
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.penalty}>{item.penaltyName}</Text>
                <Text style={styles.details}>{item.sport} • {item.team}</Text>
                <Text style={styles.user}>by {item.userName}</Text>
              </View>
              <View style={styles.ratingBox}>
                <Text style={[styles.rating, { color: getControversyColor(item.averageRating) }]}>
                  {item.averageRating.toFixed(1)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No data yet.</Text>}
        />
      ) : (
        <FlatList
          data={accuracyList}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={[styles.rank, index < 3 && { color: '#FFD700' }]}>#{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.penalty}>{item.userName}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{item.roleType}</Text>
                </View>
                <Text style={styles.user}>{item.totalActions} opinions shared</Text>
              </View>
              <View style={styles.ratingBox}>
                <Text style={[styles.rating, { color: getAccuracyColor(item.accuracyRate), fontSize: 20 }]}>
                  {item.accuracyRate.toFixed(1)}%
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No accurate kings found yet.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007BFF',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginRight: 15,
    width: 40,
    textAlign: 'center',
  },
  penalty: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  user: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingBox: {
    marginLeft: 10,
    alignItems: 'center',
    minWidth: 70,
  },
  rating: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  }
});

export default LeaderboardScreen;
