import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RulebookStackParamList } from './types';
import { getArticleById, getRuleById } from './rulebookService';
import Highlighter from 'react-native-highlight-words';

type RouteProps = RouteProp<RulebookStackParamList, 'ArticleDetail'>;

// Simple mock for "Pro Move: Contextual Definitions".
// Ideally, we would dynamically pull these from Rule 3, but for now we hardcode a mapping
// or search rule 3 if the exact term is found.
const DEFINED_TERMS = ['Player', 'Catch', 'End Zone', 'Foul', 'Penalty'];

const getDefinition = (term: string) => {
  return `Definition from Rule 3 for "${term}":\nThis is a mock definition. Imagine this text explains the precise meaning of ${term} as written in the NFL Rulebook.`;
};

const ArticleDetailScreen = () => {
  const route = useRoute<RouteProps>();
  const { ruleId, sectionId, articleId, highlightText } = route.params;

  const article = getArticleById(ruleId, sectionId, articleId);
  const rule = getRuleById(ruleId);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('');

  if (!article) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Article not found.</Text>
      </View>
    );
  }

  const handleTermPress = (term: string) => {
    setSelectedTerm(term);
    setModalVisible(true);
  };

  // Words to highlight: defined terms + any explicit search highlight passed via params
  const searchWords = [...DEFINED_TERMS];
  if (highlightText) {
    searchWords.push(highlightText);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>
          {rule?.title} {'\n'}Section {sectionId} - Article {articleId}
        </Text>

        <Highlighter
          highlightStyle={styles.highlight}
          searchWords={searchWords}
          textToHighlight={article.text}
          style={styles.bodyText}
        />

        <View style={styles.definitionsPrompt}>
          <Text style={styles.promptText}>Tap on terms like 'Player', 'Catch', or 'End Zone' (if they appear) for definitions, or just use this button for a demo:</Text>
          <TouchableOpacity style={styles.demoButton} onPress={() => handleTermPress('Catch')}>
            <Text style={styles.demoButtonText}>Demo: Define "Catch"</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedTerm}</Text>
              <Text style={styles.modalText}>{getDefinition(selectedTerm)}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  highlight: {
    backgroundColor: 'yellow',
    fontWeight: 'bold',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  definitionsPrompt: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  demoButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end', // Bottom sheet style
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 35,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ArticleDetailScreen;
