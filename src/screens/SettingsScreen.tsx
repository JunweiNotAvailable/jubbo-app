import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { Colors, FONTS } from '../lib/constants';
import Loader from '../components/Loader';
import { useAppContext } from '../contexts/AppContext';
import Input from '../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export default function SettingsScreen({ navigation }: Props) {

  const { user } = useAppContext();

  const [teamInfo, setTeamInfo] = useState<string>('');
  const [meetingInfo, setMeetingInfo] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await AsyncStorage.getItem('meetingSettings');
      if (settings) {
        const { teamInfo, meetingInfo } = JSON.parse(settings);
        setTeamInfo(teamInfo || '');
        setMeetingInfo(meetingInfo || '');
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('meetingSettings', JSON.stringify({
        teamInfo,
        meetingInfo
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
          <Loader color={Colors.gray} />
          <Text style={styles.loadingText}>Loading settings...</Text>
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
        title="Personalize"
        onBackPress={() => navigation.goBack()}
        rightComponent={saveButton}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team</Text>
            <Text style={styles.sectionSubtitle}>
              Tell us about the people in your meetings so we can analyze speaking patterns and dynamics
            </Text>
            <Input
              placeholder="E.g. Sarah (PM, tends to dominate), Mike (engineer, interrupts when excited), Lisa (designer, often quiet), John (CEO, asks lots of questions)..."
              value={teamInfo}
              onChangeText={(text: string) => setTeamInfo(text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
            />
          </View>

          {/* Meeting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meeting</Text>
            <Text style={styles.sectionSubtitle}>
              What do you want to optimize in your meetings and what are your current challenges?
            </Text>
            <Input
              placeholder="Currently run 2x too long, lots of tangents, unclear action items. Want to reduce time waste and improve decision-making..."
              value={meetingInfo}
              onChangeText={(text: string) => setMeetingInfo(text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    color: Colors.gray,
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
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
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding to ensure last input is visible
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
    color: Colors.gray,
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