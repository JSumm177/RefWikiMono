import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RulebookStackParamList } from './types';
import RulesListScreen from './RulesListScreen';
import SectionsListScreen from './SectionsListScreen';
import ArticlesListScreen from './ArticlesListScreen';
import ArticleDetailScreen from './ArticleDetailScreen';

const Stack = createNativeStackNavigator<RulebookStackParamList>();

const RulebookStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RulesList"
        component={RulesListScreen}
        options={{ title: 'Rulebook' }}
      />
      <Stack.Screen
        name="SectionsList"
        component={SectionsListScreen}
        options={({ route }) => ({ title: route.params.title || 'Sections' })}
      />
      <Stack.Screen
        name="ArticlesList"
        component={ArticlesListScreen}
        options={({ route }) => ({ title: route.params.title || 'Articles' })}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={({ route }) => ({ title: route.params.title || 'Article Detail' })}
      />
    </Stack.Navigator>
  );
};

export default RulebookStack;
