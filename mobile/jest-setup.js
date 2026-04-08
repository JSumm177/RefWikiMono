/* global jest */
import React from 'react';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve(null)),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('react-native-highlight-words', () => {
  const { Text } = require('react-native');
  return function MockHighlighter(props) {
    return <Text>{props.textToHighlight}</Text>;
  };
});
