import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RulebookStackParamList } from './types';
import { getSectionsByRuleId } from './rulebookService';

type NavigationProp = NativeStackNavigationProp<RulebookStackParamList, 'SectionsList'>;
type RouteProps = RouteProp<RulebookStackParamList, 'SectionsList'>;

const SectionsListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { ruleId } = route.params;

  const sections = getSectionsByRuleId(ruleId) || [];

  return (
    <View style={styles.container}>
      {sections.length === 0 ? (
        <Text style={styles.emptyText}>No sections found.</Text>
      ) : (
        <FlashList
          data={sections}
          keyExtractor={(item) => item.section_id.toString()}

          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => navigation.navigate('ArticlesList', { ruleId, sectionId: item.section_id, title: item.title })}
            >
              <Text style={styles.itemTitle}>{item.title}</Text>
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
    fontSize: 18,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});

export default SectionsListScreen;
