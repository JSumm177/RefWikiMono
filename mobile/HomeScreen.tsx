import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from './types';

// Mock common penalties for the "TV Mode" grid
const COMMON_PENALTIES = [
  { id: 'holding', name: 'Holding', icon: '🎽', ref: { ruleId: 12, sectionId: 1, articleId: 3 } },
  { id: 'dpi', name: 'Pass Interference', icon: '✋', ref: { ruleId: 8, sectionId: 5, articleId: 2 } },
  { id: 'false_start', name: 'False Start', icon: '🏃', ref: { ruleId: 7, sectionId: 4, articleId: 2 } },
  { id: 'neutral_zone', name: 'Neutral Zone Infraction', icon: '📏', ref: { ruleId: 7, sectionId: 4, articleId: 4 } },
  { id: 'facemask', name: 'Face Mask', icon: '😷', ref: { ruleId: 12, sectionId: 2, articleId: 5 } },
  { id: 'roughing_passer', name: 'Roughing Passer', icon: '💥', ref: { ruleId: 12, sectionId: 2, articleId: 11 } },
];

type HomeNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavigationProp>();

  const handleTilePress = (penalty: any) => {
    // Deep link to Rulebook Tab -> Article Detail
    (navigation.navigate as any)('RulebookTab', {
      screen: 'ArticleDetail',
      params: {
        ruleId: penalty.ref.ruleId,
        sectionId: penalty.ref.sectionId,
        articleId: penalty.ref.articleId,
        title: penalty.name,
        highlightText: penalty.name,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RefWiki TV Mode</Text>
        <Text style={styles.subtitle}>Quick Visual Reference</Text>
      </View>

      <View style={styles.grid}>
        {COMMON_PENALTIES.map((penalty) => (
          <TouchableOpacity
            key={penalty.id}
            style={styles.tile}
            onPress={() => handleTilePress(penalty)}
          >
            <Text style={styles.icon}>{penalty.icon}</Text>
            <Text style={styles.tileText}>{penalty.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#001529',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 48,
    marginBottom: 10,
  },
  tileText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
});

export default HomeScreen;
