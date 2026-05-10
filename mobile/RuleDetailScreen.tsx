import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BookmarkContext } from './BookmarkContext';
import { getRuleById } from './utils/search';
import type { SearchableRule } from './utils/search';
import { API_BASE_URL } from './utils/api';

interface CommunityCall {
  id: number;
  sport: string;
  team: string;
  penaltyName: string;
  ruleReference: string;
  userName: string;
  averageRating: number;
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

const RuleDetailScreen = ({ route, navigation }: any) => {
    const { id } = route.params;
    const [rule, setRule] = useState<SearchableRule | undefined>();
    const [controversialCalls, setControversialCalls] = useState<CommunityCall[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            getRuleById(id).then(async result => {
                setRule(result);
                if (result) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/leaderboard/?ruleRef=${encodeURIComponent(result.fullReference)}`);
                        if (response.ok) {
                            setControversialCalls(await response.json());
                        }
                    } catch (e) {
                        console.error("Failed to fetch rule leaderboard", e);
                    }
                }
                setIsLoading(false);
            });
        }
    }, [id]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    if (!rule) {
        return (
            <View style={styles.centered}>
                <Text>Rule not found.</Text>
            </View>
        );
    }

    const bookmarked = isBookmarked(rule.sport, rule.fullReference);
    const pending = isPending(rule.fullReference);

    const toggleBookmark = () => {
        if (pending) return;
        if (bookmarked) {
            removeBookmark(rule.sport, rule.fullReference);
        } else {
            addBookmark(rule.sport, rule.fullReference, rule.id);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{rule.ruleTitle}</Text>
                    <Text style={styles.subtitle}>{rule.sectionTitle} ({rule.sport})</Text>
                </View>
                <TouchableOpacity onPress={toggleBookmark} disabled={pending}>
                    {pending ? (
                        <ActivityIndicator size="small" color="#FFC107" />
                    ) : (
                        <Text style={[styles.bookmarkIcon, bookmarked && styles.bookmarkActive]}>
                            {bookmarked ? '★' : '☆'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={styles.reference}>{rule.fullReference}</Text>
            <Text style={styles.body}>{rule.articleText}</Text>

            <View style={styles.relatedSection}>
                <Text style={styles.relatedTitle}>🔥 Community Hall of Shame</Text>
                {controversialCalls.length === 0 ? (
                    <Text style={styles.relatedEmpty}>No controversial calls logged for this rule yet.</Text>
                ) : (
                    controversialCalls.map(call => (
                        <View key={call.id} style={[styles.miniCard, { borderLeftColor: getControversyColor(call.averageRating), borderLeftWidth: 4 }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.miniCardTitle}>{call.penaltyName} ({call.team})</Text>
                                <Text style={styles.miniCardUser}>by {call.userName}</Text>
                            </View>
                            <Text style={[styles.miniCardRating, { color: getControversyColor(call.averageRating) }]}>
                                {call.averageRating.toFixed(1)}
                            </Text>
                        </View>
                    ))
                )}
            </div>

            <View style={styles.relatedSection}>
                <Text style={styles.relatedTitle}>Related Rules</Text>
                <Text style={styles.relatedEmpty}>Search the new database to find more rules!</Text>
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
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginTop: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 15,
    },
    reference: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
        fontWeight: '500',
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    bookmarkIcon: {
        fontSize: 32,
        color: '#ccc',
        padding: 5,
    },
    bookmarkActive: {
        color: '#FFC107',
    },
    relatedSection: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    relatedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    relatedEmpty: {
        color: '#999',
        fontStyle: 'italic',
    },
    miniCard: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    miniCardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    miniCardUser: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    miniCardRating: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});

export default RuleDetailScreen;
