import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from './utils/api';
import { AuthContext } from './AuthContext';

interface CommunityCall {
  id: number;
  sport: string;
  team: string;
  penaltyName: string;
  ruleReference: string;
  userName: string;
  notes: string;
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

const CallDetailScreen = ({ route, navigation }: any) => {
    const { id } = route.params;
    const [call, setCall] = useState<CommunityCall | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const { userToken } = useContext(AuthContext);

    const fetchCall = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/calls/${id}`);
            if (response.ok) {
                setCall(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch call details', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCall();
    }, [id]);

    const handleVote = async (rating: number) => {
        if (!userToken || !call) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/calls/${call.id}/vote`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ controversyLevel: rating }),
            });
            if (response.ok) {
                fetchCall();
            }
        } catch (error) {
            console.error('Failed to vote', error);
        }
    };

    if (isLoading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007BFF" />
        </View>
    );

    if (!call) return (
        <View style={styles.centered}>
            <Text>Call not found.</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={[styles.mainCard, { borderLeftColor: getControversyColor(call.averageRating), borderLeftWidth: 10 }]}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.penaltyName}>{call.penaltyName}</Text>
                        <Text style={styles.teamInfo}>{call.team} ({call.sport})</Text>
                    </View>
                    <View style={styles.ratingCircle}>
                        <Text style={[styles.ratingValue, { color: getControversyColor(call.averageRating) }]}>
                            {call.averageRating.toFixed(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Rule Reference</Text>
                <Text style={styles.referenceText}>{call.ruleReference}</Text>

                <View style={styles.quoteBox}>
                    <Text style={styles.quoteText}>"{call.notes}"</Text>
                    <Text style={styles.quoteAuthor}>— {call.userName}</Text>
                </View>

                <View style={styles.voteSection}>
                    <Text style={styles.voteTitle}>Community Controversy Scale</Text>
                    <View style={styles.voteRow}>
                        {[1, 2, 3, 4, 5].map((lvl) => (
                            <TouchableOpacity
                                key={lvl}
                                style={[styles.voteButton, { borderColor: getControversyColor(lvl) }]}
                                onPress={() => handleVote(lvl)}
                            >
                                <Text style={[styles.voteButtonText, { color: getControversyColor(lvl) }]}>{lvl}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.voteCount}>{call.voteCount} total votes cast</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 15,
    },
    mainCard: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    penaltyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    teamInfo: {
        fontSize: 18,
        color: '#666',
        marginTop: 4,
    },
    ratingCircle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingValue: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 20,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase',
    },
    referenceText: {
        fontSize: 18,
        color: '#333',
        marginTop: 5,
        marginBottom: 20,
    },
    quoteBox: {
        backgroundColor: '#eee',
        padding: 15,
        borderRadius: 10,
        marginBottom: 25,
    },
    quoteText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#444',
        lineHeight: 22,
    },
    quoteAuthor: {
        textAlign: 'right',
        fontWeight: 'bold',
        marginTop: 10,
        color: '#666',
    },
    voteSection: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 20,
    },
    voteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    voteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    voteButton: {
        flex: 1,
        height: 45,
        borderRadius: 25,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voteButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    voteCount: {
        textAlign: 'center',
        marginTop: 15,
        color: '#999',
        fontSize: 12,
    }
});

export default CallDetailScreen;
