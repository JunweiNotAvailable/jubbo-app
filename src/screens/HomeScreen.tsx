import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [isListening, setIsListening] = useState(false);

  const handleToggleListening = () => {
    if (isListening) {
      // Stop listening - navigate to advice page
      setIsListening(false);
      navigation.navigate('Advices');
    } else {
      // Start listening
      setIsListening(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Status Label */}
      <View style={styles.statusContainer}>
        {isListening && (
          <Text style={styles.statusText}>Listening…</Text>
        )}
      </View>

      {/* Main Content - Centered Button */}
      <View style={styles.mainContent}>
        <TouchableOpacity 
          style={[styles.listeningButton, isListening && styles.listeningButtonActive]} 
          onPress={handleToggleListening}
        >
          <Text style={[styles.buttonText, isListening && styles.buttonTextActive]}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statusContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  statusText: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  listeningButtonActive: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextActive: {
    color: 'white',
  },
}); 