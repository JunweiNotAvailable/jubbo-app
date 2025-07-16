import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../components/Input';
import { Colors, FONTS } from '../lib/constants';
import { useAppContext } from '../contexts/AppContext';

export default function TempNameScreen() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAppContext();

  const handleSaveName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('username', name.trim());

      // Update context with complete user object
      setUser({
        id: '',
        name: name.trim(),
        email: '',
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to save name. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar style="auto" />

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>
                Let's get started by knowing your name
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Your Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
                maxLength={50}
              />

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!name.trim() || isLoading) && styles.saveButtonDisabled
                ]}
                onPress={handleSaveName}
                disabled={!name.trim() || isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: '#fff',
  },
});
