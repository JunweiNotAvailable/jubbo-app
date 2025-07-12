import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export interface UserPreferences {
  personalityStyle: string;
  conversationGoals: string[];
  currentMood: string;
  communicationStyle: string;
  preferredTone: string;
}

const defaultPreferences: UserPreferences = {
  personalityStyle: '',
  conversationGoals: [],
  currentMood: 'neutral',
  communicationStyle: 'balanced',
  preferredTone: 'warm',
};

export default function SettingsScreen({ navigation }: Props) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('userPreferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      Alert.alert('Success', 'Your preferences have been saved!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save your preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: string | string[]) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleGoal = (goal: string) => {
    const currentGoals = preferences.conversationGoals;
    if (currentGoals.includes(goal)) {
      updatePreference('conversationGoals', currentGoals.filter(g => g !== goal));
    } else {
      updatePreference('conversationGoals', [...currentGoals, goal]);
    }
  };

  const predefinedGoals = [
    'Better listening',
    'Clear communication',
    'Empathy building',
    'Conflict resolution',
    'Confidence building',
    'Professional communication',
  ];

  const communicationStyles = [
    { value: 'direct', label: 'Direct & Straightforward' },
    { value: 'diplomatic', label: 'Diplomatic & Careful' },
    { value: 'balanced', label: 'Balanced Approach' },
    { value: 'empathetic', label: 'Empathetic & Understanding' },
  ];

  const tones = [
    { value: 'warm', label: 'Warm & Friendly' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual & Relaxed' },
    { value: 'assertive', label: 'Assertive & Confident' },
  ];

  const moods = [
    { value: 'happy', label: 'Happy' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'stressed', label: 'Stressed' },
    { value: 'anxious', label: 'Anxious' },
    { value: 'confident', label: 'Confident' },
    { value: 'tired', label: 'Tired' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Settings</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={savePreferences}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personality Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us about yourself</Text>
          <Text style={styles.sectionSubtitle}>
            Help us understand your communication style and personality
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your personality and communication preferences..."
            value={preferences.personalityStyle}
            onChangeText={(text) => updatePreference('personalityStyle', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Current Mood */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.optionsGrid}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.optionButton,
                  preferences.currentMood === mood.value && styles.optionButtonSelected
                ]}
                onPress={() => updatePreference('currentMood', mood.value)}
              >
                <Text style={[
                  styles.optionText,
                  preferences.currentMood === mood.value && styles.optionTextSelected
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Communication Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to improve?</Text>
          <Text style={styles.sectionSubtitle}>Select your communication goals</Text>
          <View style={styles.goalsContainer}>
            {predefinedGoals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalChip,
                  preferences.conversationGoals.includes(goal) && styles.goalChipSelected
                ]}
                onPress={() => toggleGoal(goal)}
              >
                <Text style={[
                  styles.goalText,
                  preferences.conversationGoals.includes(goal) && styles.goalTextSelected
                ]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Communication Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Communication Style</Text>
          {communicationStyles.map((style) => (
            <TouchableOpacity
              key={style.value}
              style={[
                styles.radioOption,
                preferences.communicationStyle === style.value && styles.radioOptionSelected
              ]}
              onPress={() => updatePreference('communicationStyle', style.value)}
            >
              <View style={[
                styles.radioCircle,
                preferences.communicationStyle === style.value && styles.radioCircleSelected
              ]} />
              <Text style={styles.radioText}>{style.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferred Tone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Tone</Text>
          {tones.map((tone) => (
            <TouchableOpacity
              key={tone.value}
              style={[
                styles.radioOption,
                preferences.preferredTone === tone.value && styles.radioOptionSelected
              ]}
              onPress={() => updatePreference('preferredTone', tone.value)}
            >
              <View style={[
                styles.radioCircle,
                preferences.preferredTone === tone.value && styles.radioCircleSelected
              ]} />
              <Text style={styles.radioText}>{tone.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    minHeight: 80,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  optionButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  optionText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  optionTextSelected: {
    color: 'white',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  goalChipSelected: {
    backgroundColor: '#e8f5e8',
    borderColor: '#27ae60',
  },
  goalText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  goalTextSelected: {
    color: '#27ae60',
    fontWeight: '500',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  radioOptionSelected: {
    borderColor: '#3498db',
    backgroundColor: '#f8fbff',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#3498db',
    backgroundColor: '#3498db',
  },
  radioText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#7f8c8d',
  },
});