import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { CallHistoryContext } from './CallHistoryContext';
import { searchRules } from './utils/search';
import type { SearchableRule } from './utils/search';

const CONTROVERSY_LEVELS = [
  { level: 1, label: 'Textbook', description: 'Clear-cut, no debate', color: '#4CAF50' },
  { level: 2, label: 'Technically Correct', description: 'Letter of the Law vs. Spirit', color: '#8BC34A' },
  { level: 3, label: 'Let \'em Play', description: 'Ticky-tack call', color: '#FFC107' },
  { level: 4, label: 'Game Changer', description: 'Massive penalty', color: '#FF9800' },
  { level: 5, label: 'Total Robbery', description: 'Refs absolutely blew it', color: '#F44336' },
];

const LogCallScreen = ({ navigation }: any) => {
  const { addCall } = useContext(CallHistoryContext);

  const [penaltyName, setPenaltyName] = useState('');
  const [ruleReference, setRuleReference] = useState('');
  const [notes, setNotes] = useState('');
  const [controversyLevel, setControversyLevel] = useState(1);
  const [searchResults, setSearchResults] = useState<SearchableRule[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = async () => {
    if (!penaltyName || !ruleReference) {
      Alert.alert('Missing Fields', 'Please enter a penalty name and rule reference.');
      return;
    }

    await addCall({
      penaltyName,
      ruleReference,
      controversyLevel,
      notes,
    });

    setPenaltyName('');
    setRuleReference('');
    setNotes('');
    setControversyLevel(1);

    Alert.alert('Success', 'Call logged to history!', [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Log a Recent Call</Text>

      <Text style={styles.label}>Penalty Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Defensive Pass Interference"
        value={penaltyName}
        onChangeText={setPenaltyName}
      />

      <Text style={styles.label}>Rule Reference</Text>
      <View style={{ zIndex: 10 }}>
        <TextInput
          style={[styles.input, showDropdown && searchResults.length > 0 && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}
          placeholder="e.g. Rule 8, Section 5"
          value={ruleReference}
          onChangeText={(val) => {
            setRuleReference(val);
            if (val.trim() !== '') {
              setSearchResults(searchRules(val));
              setShowDropdown(true);
            } else {
              setSearchResults([]);
              setShowDropdown(false);
            }
          }}
          onFocus={() => {
            if (ruleReference.trim() !== '') {
              setSearchResults(searchRules(ruleReference));
              setShowDropdown(true);
            }
          }}
        />
        {showDropdown && searchResults.length > 0 && (
          <ScrollView style={styles.dropdownContainer} nestedScrollEnabled={true}>
            {searchResults.slice(0, 10).map((rule, idx) => (
              <TouchableOpacity
                key={`${rule.ruleId}-${rule.sectionId}-${rule.articleId}-${idx}`}
                style={[
                  styles.dropdownItem,
                  idx === Math.min(searchResults.length, 10) - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => {
                  setRuleReference(rule.fullReference);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemTitle}>
                  <Text style={{ fontWeight: 'bold' }}>{rule.fullReference}</Text>: {rule.ruleTitle} - {rule.sectionTitle}
                </Text>
                <Text style={styles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                  {rule.articleText}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <Text style={styles.label}>Controversy Level</Text>
      <View style={styles.sliderContainer}>
        {CONTROVERSY_LEVELS.map((item) => (
          <TouchableOpacity
            key={item.level}
            style={[
              styles.levelButton,
              controversyLevel === item.level && { backgroundColor: item.color, borderColor: item.color }
            ]}
            onPress={() => setControversyLevel(item.level)}
          >
            <Text style={[
              styles.levelTitle,
              controversyLevel === item.level && { color: '#fff' }
            ]}>
              {item.level}. {item.label}
            </Text>
            {controversyLevel === item.level && (
              <Text style={styles.levelDesc}>{item.description}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Looked like a clean break on the ball..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Log Call</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#666',
  },
  sliderContainer: {
    marginVertical: 10,
  },
  levelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  levelDesc: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LogCallScreen;
