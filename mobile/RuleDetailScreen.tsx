import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BookmarkContext } from './BookmarkContext';
import { getRuleByReference, getRuleByFullReference } from './utils/search';
import relations from './assets/rule_relations.json';

const RuleDetailScreen = ({ route, navigation }: any) => {
    const { sport, ruleId, sectionId, articleId } = route.params;
    const rule = getRuleByReference(sport as any, ruleId, sectionId, articleId);
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    if (!rule) {
        return (
            <View style={styles.container}>
                <Text>Rule not found.</Text>
            </View>
        );
    }

    const key = `${rule.ruleId}-${rule.sectionId}-${rule.articleId}`;
    const relatedRefs = (relations as any)[key] || [];

    const bookmarked = isBookmarked(rule.sport, rule.fullReference);
    const pending = isPending(rule.fullReference);

    const toggleBookmark = () => {
        if (pending) return;
        if (bookmarked) {
            removeBookmark(rule.sport, rule.fullReference);
        } else {
            addBookmark(rule.sport, rule.fullReference);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{rule.ruleTitle}</Text>
                    <Text style={styles.subtitle}>{rule.sectionTitle} ({rule.sport.toUpperCase()})</Text>
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
                {relatedRefs.length === 0 ? (
                    <Text style={styles.relatedEmpty}>No related rules found.</Text>
                ) : (
                    relatedRefs.map((ref: string) => {
                        const r = getRuleByFullReference(rule.sport, ref);
                        if (!r) return null;
                        return (
                            <TouchableOpacity
                                key={ref}
                                style={styles.relatedLink}
                                onPress={() => navigation.push('RuleDetail', {
                                    sport: r.sport,
                                    ruleId: r.ruleId,
                                    sectionId: r.sectionId,
                                    articleId: r.articleId
                                })}
                            >
                                <Text style={styles.relatedLinkText}>• {ref}</Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    relatedLink: {
        paddingVertical: 8,
    },
    relatedLinkText: {
        color: '#007BFF',
        fontSize: 16,
    }
});

export default RuleDetailScreen;
