import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { Colors, FONTS } from '../lib/constants';
import Loader from '../components/Loader';
import { useAppContext } from '../contexts/AppContext';
import Input from '../components/Input';
import Select from '../components/Select';


type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export default function SettingsScreen({ navigation }: Props) {

  const { user } = useAppContext();

  const [personality, setPersonality] = useState<string>('');
  const [aboutConversation, setAboutConversation] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const aiModels = [
    { id: 'gemini', name: 'Gemini 2.0 Flash' },
    { id: 'llama', name: 'Llama 4 Scout' },
    { id: 'openai', name: 'GPT-4.1 Nano' },
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

        {/* Personality Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us about yourself</Text>
          <Text style={styles.sectionSubtitle}>
            Hi, {user?.name}! Help us understand your communication style and personality
          </Text>
          <Input
            placeholder="Describe your personality and communication preferences..."
            value={personality}
            onChangeText={(text: string) => setPersonality(text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
          />
        </View>

        {/* About Conversation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the conversation</Text>
          <Text style={styles.sectionSubtitle}>
            Help us understand more about the conversation
          </Text>
          <Input
            placeholder="Describe the conversation you're having"
            value={aboutConversation}
            onChangeText={(text: string) => setAboutConversation(text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
          />
        </View>

        {/* AI Model Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Model</Text>
          <Select
            value={selectedModel}
            options={aiModels}
            onSelect={setSelectedModel}
          />
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
  loadingText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.semiBold,
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
    fontFamily: FONTS.semiBold,
  },
  sectionSubtitle: {
    color: '#7f8c8d',
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 10,
    lineHeight: 18,
  },

  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 5,
  },
  picker: {
    height: 120,
    width: '100%',
    color: '#34495e',
  },
});