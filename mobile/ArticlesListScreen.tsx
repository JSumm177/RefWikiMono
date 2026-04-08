import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RulebookStackParamList } from './types';
import { getArticlesBySectionId } from './rulebookService';

type NavigationProp = NativeStackNavigationProp<RulebookStackParamList, 'ArticlesList'>;
type RouteProps = RouteProp<RulebookStackParamList, 'ArticlesList'>;

const ArticlesListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { ruleId, sectionId } = route.params;

  const articles = getArticlesBySectionId(ruleId, sectionId) || [];

  return (
    <View style={styles.container}>
      {articles.length === 0 ? (
        <Text style={styles.emptyText}>No articles found.</Text>
      ) : (
        <FlashList
          data={articles}
          keyExtractor={(item) => item.article_id.toString()}

          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => navigation.navigate('ArticleDetail', { ruleId, sectionId, articleId: item.article_id, title: `Article ${item.article_id}` })}
            >
              <Text style={styles.itemTitle} numberOfLines={2}>
                Article {item.article_id}: {item.text}
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
  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});

export default ArticlesListScreen;
