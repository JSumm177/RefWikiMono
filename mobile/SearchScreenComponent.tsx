import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Fuse from 'fuse.js';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from './types';
import { getFlattenedArticles, FlatArticle } from './rulebookService';

type SearchNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Search'>;

const SearchScreenComponent = () => {
  const navigation = useNavigation<SearchNavigationProp>();
  const [query, setQuery] = useState('');

  const articles = useMemo(() => getFlattenedArticles(), []);

  const fuse = useMemo(
    () =>
      new Fuse(articles, {
        keys: ['text', 'ruleTitle', 'sectionTitle'],
        threshold: 0.3, // Fuzzy match threshold
        includeScore: true,
      }),
    [articles]
  );

  const results = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).map((result) => result.item);
  }, [query, fuse]);

  const handleResultPress = (item: FlatArticle) => {
    (navigation.navigate as any)('RulebookTab', {
      screen: 'ArticleDetail',
      params: {
        ruleId: item.ruleId,
        sectionId: item.sectionId,
        articleId: item.articleId,
        title: `Search Result`,
        highlightText: query,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rules, e.g., 'holding' or 'end zone'"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {query.length > 0 && results.length === 0 ? (
        <Text style={styles.emptyText}>No results found for "{query}".</Text>
      ) : (
        <FlashList
          data={results}
          keyExtractor={(item) => `${item.ruleId}-${item.sectionId}-${item.articleId}`}

          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleResultPress(item)}>
              <Text style={styles.resultTitle}>
                {item.ruleTitle} - Section {item.sectionId} - Article {item.articleId}
              </Text>
              <Text style={styles.resultSnippet} numberOfLines={3}>
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  resultSnippet: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});

export default SearchScreenComponent;
