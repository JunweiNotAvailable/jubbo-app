import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../lib/config';
import Header from '../components/Header';
import { Colors } from '../lib/constants';
import Loader from '../components/Loader';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export default function SettingsScreen({ navigation }: Props) {

  const [personality, setPersonality] = useState<string>('');
  const [aboutConversation, setAboutConversation] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await AsyncStorage.getItem('customization');
      if (settings) {
        const { personality, aboutConversation } = JSON.parse(settings);
        setPersonality(personality);
        setAboutConversation(aboutConversation);
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('customization', JSON.stringify({ personality, aboutConversation }));
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
            Help us understand your communication style and personality
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
  
});