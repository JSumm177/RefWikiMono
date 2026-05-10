import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from './utils/api';
import { AuthContext } from './AuthContext';

interface CommunityCall {
  id: number;
  sport: string;
  team: string;
  penaltyName: string;
  ruleReference: string;
  originalControversy: number;
  notes: string;
  userName: string;
  timestamp: string;
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

const CommunityFeed = () => {
  const [calls, setCalls] = useState<CommunityCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/community`);
      if (response.ok) {
        setCalls(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch community feed', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, []);

  const handleVote = async (callId: number, rating: number) => {
    if (!userToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/${callId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ controversyLevel: rating }),
      });
      if (response.ok) {
        fetchCommunity();
      }
    } catch (error) {
      console.error('Failed to vote', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community Consensus</Text>
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: getControversyColor(item.averageRating), borderLeftWidth: 8 }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.penaltyName}</Text>
                <Text style={styles.cardSubtitle}>{item.sport} • {item.team}</Text>
              </View>
              <View style={styles.ratingBox}>
                <Text style={[styles.avgRating, { color: getControversyColor(item.averageRating) }]}>
                  {item.averageRating.toFixed(1)}
                </Text>
                <Text style={styles.voteCount}>{item.voteCount} votes</Text>
              </View>
            </View>

            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>"{item.notes}"</Text>
              <Text style={styles.quoteAuthor}>— {item.userName}</Text>
            </View>

            <Text style={styles.votePrompt}>How would you rate this call?</Text>
            <View style={styles.voteRow}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.voteButton, { borderColor: getControversyColor(lvl) }]}
                  onPress={() => handleVote(item.id, lvl)}
                >
                  <Text style={[styles.voteButtonText, { color: getControversyColor(lvl) }]}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingBox: {
    alignItems: 'center',
  },
  avgRating: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  voteCount: {
    fontSize: 10,
    color: '#999',
  },
  quoteBox: {
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  quoteText: {
    fontStyle: 'italic',
    color: '#444',
  },
  quoteAuthor: {
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#666',
  },
  votePrompt: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  voteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  voteButton: {
    flex: 1,
    height: 35,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteButtonText: {
    fontWeight: 'bold',
  },
});

export default CommunityFeed;
