import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';
import { audioService, RecordingResult } from '../lib/audio';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isListening]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleToggleListening = async () => {
    if (isListening) {
      // Stop listening and process audio
      setIsProcessing(true);
      
      try {
        const result = await audioService.stopRecording();
        setIsListening(false);
        
        if (result) {
          // Navigate to advice page with recording data
          navigation.navigate('Advices', { recordingResult: result });
        } else {
          Alert.alert('Error', 'Failed to save recording');
        }
      } catch (error) {
        console.error('Recording error:', error);
        Alert.alert('Error', 'Failed to stop recording');
        setIsListening(false);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start listening
      const success = await audioService.startRecording();
      if (success) {
        setIsListening(true);
      } else {
        Alert.alert('Permission Required', 'Please allow microphone access to record conversations');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header with Settings */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.appTitle}>Genuconv</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Status Label */}
      <View style={styles.statusContainer}>
        {isListening && (
          <Text style={styles.statusText}>Listening…</Text>
        )}
        {isProcessing && (
          <Text style={styles.statusText}>Processing…</Text>
        )}
      </View>

      {/* Main Content - Centered Button */}
      <View style={styles.mainContent}>
        <Animated.View
          style={[
            styles.listeningButton,
            isListening && styles.listeningButtonActive,
            isProcessing && styles.listeningButtonProcessing,
            {
              transform: [{ scale: pulseAnimation }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.buttonTouchable}
            onPress={handleToggleListening}
            disabled={isProcessing}
          >
            <Text style={[styles.buttonText, isListening && styles.buttonTextActive]}>
              {isProcessing ? 'Processing...' : isListening ? 'Stop Listening' : 'Start Listening'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
  headerLeft: {
    width: 40,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 20,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 90,
  },
  listeningButtonActive: {
    backgroundColor: '#e74c3c',
  },
  listeningButtonProcessing: {
    backgroundColor: '#f39c12',
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