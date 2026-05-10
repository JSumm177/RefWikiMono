import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from './utils/api';

interface CommunityCall {
  id: number;
  sport: string;
  team: string;
  penaltyName: string;
  ruleReference: string;
  userName: string;
  averageRating: number;
  voteCount: number;
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

const LeaderboardScreen = () => {
  const [calls, setCalls] = useState<CommunityCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard/`);
        if (response.ok) {
          setCalls(await response.json());
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
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
      <Text style={styles.header}>🔥 Hall of Shame</Text>
      <Text style={styles.subHeader}>Most controversial community-rated calls</Text>

      <FlatList
        data={calls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
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
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No data yet. Get voting in the community feed!</Text>
        }
      />
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
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
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
    width: 35,
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
  ratingBox: {
    marginLeft: 10,
    alignItems: 'center',
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
