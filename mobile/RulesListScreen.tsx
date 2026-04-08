import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RulebookStackParamList } from './types';
import { getRules } from './rulebookService';

type NavigationProp = NativeStackNavigationProp<RulebookStackParamList, 'RulesList'>;

const RulesListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const rules = getRules();

  return (
    <View style={styles.container}>
      <FlashList
        data={rules}
        keyExtractor={(item) => item.rule_id.toString()}

        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('SectionsList', { ruleId: item.rule_id, title: item.title })}
          >
            <Text style={styles.itemTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
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
});

export default RulesListScreen;
