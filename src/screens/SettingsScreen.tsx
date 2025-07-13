import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../lib/config';

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  // Generate or retrieve user ID
  const getUserId = async (): Promise<string> => {
    try {
      let storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        await AsyncStorage.setItem('userId', storedUserId);
      }
      return storedUserId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }
  };

  const loadPreferences = async () => {
    try {
      const currentUserId = await getUserId();
      setUserId(currentUserId);

      // Try to load from server first
      try {
        const response = await fetch(`${API_URL}/api/data?table=user_preferences&user_id=${currentUserId}&limit=1`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          const prefs = data.data[0];
          setPreferences({
            personalityStyle: prefs.personality_style || '',
            conversationGoals: JSON.parse(prefs.conversation_goals || '[]'),
            currentMood: prefs.current_mood || 'neutral',
            communicationStyle: prefs.communication_style || 'balanced',
            preferredTone: prefs.preferred_tone || 'warm',
          });
        } else {
          // Fallback to local storage if no server data
          const stored = await AsyncStorage.getItem('userPreferences');
          if (stored) {
            setPreferences(JSON.parse(stored));
          }
        }
      } catch (serverError) {
        console.error('Failed to load from server, using local storage:', serverError);
        // Fallback to local storage
        const stored = await AsyncStorage.getItem('userPreferences');
        if (stored) {
          setPreferences(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not available');
      return;
    }

    setIsSaving(true);
    try {
      // Save to local storage first (as backup)
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));

      // Prepare data for server
      const preferenceData = {
        user_id: userId,
        personality_style: preferences.personalityStyle,
        conversation_goals: JSON.stringify(preferences.conversationGoals),
        current_mood: preferences.currentMood,
        communication_style: preferences.communicationStyle,
        preferred_tone: preferences.preferredTone,
        updated_at: new Date().toISOString(),
      };

      try {
        // Check if user preferences already exist
        const checkResponse = await fetch(`${API_URL}/api/data?table=user_preferences&user_id=${userId}&limit=1`);
        const checkData = await checkResponse.json();
        
        if (checkData.success && checkData.data.length > 0) {
          // Update existing preferences
          const existingId = checkData.data[0].id;
          const updateResponse = await fetch(`${API_URL}/api/data/${existingId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              table: 'user_preferences',
              data: preferenceData,
            }),
          });
          
          if (!updateResponse.ok) {
            throw new Error('Failed to update preferences');
          }
        } else {
          // Create new preferences record
          const createResponse = await fetch(`${API_URL}/api/data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              table: 'user_preferences',
              data: {
                ...preferenceData,
                created_at: new Date().toISOString(),
              },
            }),
          });
          
          if (!createResponse.ok) {
            throw new Error('Failed to create preferences');
          }
        }
        
        Alert.alert('Success', 'Your preferences have been saved!');
      } catch (serverError) {
        console.error('Failed to save to server:', serverError);
        Alert.alert('Saved Locally', 'Your preferences have been saved locally. They will sync when connection is available.');
      }
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
        {/* User ID Display */}
        {userId && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>User ID: {userId}</Text>
          </View>
        )}

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
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 100,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  goalChipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  goalText: {
    color: '#fff',
    fontSize: 12,
  },
  goalTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  radioOptionSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
  },
  radioCircleSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  radioText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
});