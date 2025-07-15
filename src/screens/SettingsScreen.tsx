import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { Colors } from '../lib/constants';
import Loader from '../components/Loader';
import { useAppContext } from '../contexts/AppContext';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export default function SettingsScreen({ navigation }: Props) {

  const { user } = useAppContext();

  const [personality, setPersonality] = useState<string>('');
  const [aboutConversation, setAboutConversation] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini');
  const [isModelModalVisible, setIsModelModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const aiModels = [
    { id: 'gemini', name: 'Gemini 2.0 Flash', description: 'Google - Fast and efficient' },
    { id: 'openai', name: 'GPT-4.1 Nano', description: 'OpenAI - Quick and versatile' },
    { id: 'claude', name: 'Claude 3.5 Haiku', description: 'Anthropic - Precise and thoughtful' },
    { id: 'llama', name: 'Llama 4 Scout', description: 'Meta via Groq - Lightning fast' },
  ];

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await AsyncStorage.getItem('customization');
      if (settings) {
        const { personality, aboutConversation, selectedModel } = JSON.parse(settings);
        setPersonality(personality || '');
        setAboutConversation(aboutConversation || '');
        setSelectedModel(selectedModel || 'gemini');
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('customization', JSON.stringify({ 
        personality, 
        aboutConversation, 
        selectedModel 
      }));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <Header title="Settings" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading customization...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const saveButton = (
    <TouchableOpacity
      style={styles.saveButton}
      onPress={saveSettings}
      disabled={isSaving}
    >
      {isSaving ? <Loader /> : <Text style={styles.saveButtonText}>Save</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <Header
        title="Settings"
        onBackPress={() => navigation.goBack()}
        rightComponent={saveButton}
      />

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
            Hi, {user?.name}! Help us understand your communication style and personality
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your personality and communication preferences..."
            value={personality}
            onChangeText={(text) => setPersonality(text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* About Conversation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the conversation</Text>
          <Text style={styles.sectionSubtitle}>
            Help us understand more about the conversation
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe the conversation you're having"
            value={aboutConversation}
            onChangeText={(text) => setAboutConversation(text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* AI Model Selection */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Model</Text>
          <Text style={styles.sectionSubtitle}>
            Choose which AI model to use for conversation advice
          </Text>
          <TouchableOpacity
            style={styles.modelSelector}
            onPress={() => setIsModelModalVisible(true)}
          >
            <View style={styles.modelSelectorContent}>
              <View style={styles.modelSelectorLeft}>
                <Text style={styles.modelSelectorTitle}>
                  {aiModels.find(m => m.id === selectedModel)?.name || 'Select Model'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View> */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    marginTop: 10,
  },
  sectionSubtitle: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 18,
  },
  textInput: {
    backgroundColor: '#fff',
    color: '#34495e',
    padding: 10,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 120,
  },
  modelSelector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelSelectorLeft: {
    flex: 1,
  },
  modelSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 2,
  },
  modelSelectorDescription: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34495e',
  },
  modalCloseButton: {
    padding: 5,
  },
  modelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modelOptionSelected: {
    backgroundColor: '#f0f9eb', // Light green background for selected option
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  modelOptionContent: {
    flex: 1,
  },
  modelOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
  },
  modelOptionTitleSelected: {
    color: Colors.primary,
  },
});