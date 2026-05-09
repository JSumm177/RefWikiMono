import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BookmarkContext } from './BookmarkContext';
import { getRuleById } from './utils/search';
import type { SearchableRule } from './utils/search';

const RuleDetailScreen = ({ route, navigation }: any) => {
    const { id } = route.params;
    const [rule, setRule] = useState<SearchableRule | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            getRuleById(id).then(result => {
                setRule(result);
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
    }
});

export default RuleDetailScreen;
