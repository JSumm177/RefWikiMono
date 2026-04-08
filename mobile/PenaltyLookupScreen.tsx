import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RulebookStackParamList } from './types';

// Mock penalty definitions mapping to dummy rules
const PENALTIES = [
  { id: 'holding', name: 'Holding', result: '10 yards', down: 'Replay Down', ref: { ruleId: 12, sectionId: 1, articleId: 3 } },
  { id: 'dpi', name: 'Pass Interference', result: 'Spot of foul', down: 'Automatic First Down', ref: { ruleId: 8, sectionId: 5, articleId: 2 } },
  { id: 'false_start', name: 'False Start', result: '5 yards', down: 'Replay Down', ref: { ruleId: 7, sectionId: 4, articleId: 2 } },
  { id: 'neutral_zone', name: 'Neutral Zone Infraction', result: '5 yards', down: 'Replay Down', ref: { ruleId: 7, sectionId: 4, articleId: 4 } },
];

const CONTEXTS = [
  { id: 'offense', name: 'Offense' },
  { id: 'defense', name: 'Defense' },
  { id: 'kicking', name: 'Kicking Team' },
  { id: 'receiving', name: 'Receiving Team' },
];

type PenaltyNavigationProp = NativeStackNavigationProp<any>;

const PenaltyLookupScreen = () => {
  const navigation = useNavigation<PenaltyNavigationProp>();
  const [selectedPenaltyId, setSelectedPenaltyId] = useState(PENALTIES[0].id);
  const [selectedContextId, setSelectedContextId] = useState(CONTEXTS[0].id);

  const selectedPenalty = PENALTIES.find((p) => p.id === selectedPenaltyId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ref-to-Rule Translator</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Column A (The Call):</Text>
        <Picker
          selectedValue={selectedPenaltyId}
          onValueChange={(itemValue) => setSelectedPenaltyId(itemValue)}
          style={styles.picker}
        >
          {PENALTIES.map((penalty) => (
            <Picker.Item key={penalty.id} label={penalty.name} value={penalty.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Column B (The Context):</Text>
        <Picker
          selectedValue={selectedContextId}
          onValueChange={(itemValue) => setSelectedContextId(itemValue)}
          style={styles.picker}
        >
          {CONTEXTS.map((context) => (
            <Picker.Item key={context.id} label={context.name} value={context.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>The Result:</Text>
        {selectedPenalty && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>Yardage: <Text style={styles.bold}>{selectedPenalty.result}</Text></Text>
            <Text style={styles.resultText}>Down: <Text style={styles.bold}>{selectedPenalty.down}</Text></Text>

            <TouchableOpacity
              style={styles.whyButton}
              onPress={() => {
                navigation.navigate('RulebookTab', {
                  screen: 'ArticleDetail',
                  params: {
                    ruleId: selectedPenalty.ref.ruleId,
                    sectionId: selectedPenalty.ref.sectionId,
                    articleId: selectedPenalty.ref.articleId,
                    title: selectedPenalty.name,
                    highlightText: selectedPenalty.name
                  }
                });
              }}
            >
              <Text style={styles.whyButtonText}>Why? (Read the Rule)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  resultContainer: {
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultBox: {
    padding: 20,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#91d5ff',
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  whyButton: {
    marginTop: 15,
    backgroundColor: '#1890ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  whyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PenaltyLookupScreen;
