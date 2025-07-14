import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';
import { audioService, RecordingResult } from '../lib/audio';
import { useAppContext } from '../contexts/AppContext';
import { Config } from '../lib/config';
import { generateId } from '../lib/functions';
import { AdviceModel, AdviceData } from '../lib/models';
import Header from '../components/Header';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAppContext();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
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

  /**
   * Start audio recording
   * Requests permissions and begins capturing audio
   */
  const handleListen = async () => {
    try {
      console.log('User tapped listen button');
      
      // Start recording using audio service
      const result = await audioService.startRecording();
      
      if (result.success) {
        console.log('Recording started successfully');
        setIsListening(true);
      } else {
        console.log('Recording failed:', result.message);
        Alert.alert(
          'Recording Failed', 
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error in handleListen:', error);
      Alert.alert(
        'Error', 
        'An unexpected error occurred while trying to start recording.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Stop recording and process audio through complete AI pipeline
   * 1. Stop audio recording
   * 2. Upload audio to server for transcription and analysis
   * 3. Save advice data to database
   * 4. Navigate to advice screen with results
   */
  const handleProcessAudio = async () => {
    try {
      setIsListening(false);
      setIsProcessing(true);
      setProcessingStatus('Stopping recording...');
      
      // Step 1: Stop recording and get audio file
      const result = await audioService.stopRecording();
      
      if (!result || !result.uri) {
        throw new Error('Failed to stop recording or no audio recorded');
      }
      
      setRecordingResult(result);
      setProcessingStatus('Preparing audio for analysis...');
      
      // Step 2: Prepare audio file for upload
      const formData = new FormData();
      
      // Add audio file to form data
      formData.append('audio', {
        uri: result.uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      
      // Add context information
      const context = {
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        duration: result.duration,
      };
      formData.append('context', JSON.stringify(context));
      
      // Step 3: Send audio to server for complete analysis (transcription + advice)
      setProcessingStatus('Analyzing speech and generating advice...');
      console.log('Sending audio to server for analysis...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for AI processing
      
      try {
        const response = await fetch(`${Config.apiUrl}/api/ai/analyze-audio`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const analysisData = await response.json();
        
        if (!analysisData.success) {
          throw new Error(analysisData.error || 'Analysis failed');
        }
        
        console.log('Analysis completed successfully');
        setProcessingStatus('Saving advice...');
        
        // Step 4: Create complete AdviceModel
        const adviceModel: AdviceModel = {
          id: generateId('advice'),
          user_id: user?.id || '',
          created_at: new Date().toISOString(),
          audio_url: result.uri, // Store local URI for now
          data: analysisData.data.advice as AdviceData,
        };
        
        // Step 5: Save advice to database
        if (user?.id) {
          try {
            console.log('Saving advice to database...');
            
            const saveResponse = await fetch(`${Config.apiUrl}/api/data/advices`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(adviceModel),
            });
            
            if (saveResponse.ok) {
              console.log('Advice saved to database successfully');
            } else {
              console.warn('Failed to save advice to database, but continuing...');
            }
          } catch (saveError) {
            console.error('Error saving advice to database:', saveError);
            // Continue anyway, user can still see the advice
          }
        }
        
        setProcessingStatus('Complete!');
        
        // Step 6: Navigate to advice screen with the complete AdviceModel
        navigation.navigate('Advices', { 
          result: result,
          advice: adviceModel,
        });
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            throw new Error('Processing is taking longer than expected. This can happen with longer recordings or during high server load. Please try with a shorter recording or try again later.');
          } else if (fetchError.message.includes('Network request failed') || fetchError.message.includes('fetch')) {
            throw new Error('Unable to connect to server. Please check your network connection.');
          } else {
            throw fetchError;
          }
        } else {
          throw new Error('An unexpected error occurred during audio processing.');
        }
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to process audio. ';
      if (error instanceof Error) {
        if (error.message.includes('No transcription available')) {
          errorMessage += 'No speech was detected in the recording.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Please check your internet connection.';
        } else {
          errorMessage += 'Please try again.';
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      Alert.alert(
        'Processing Failed', 
        errorMessage,
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Clean up recording if it exists
              if (recordingResult?.uri) {
                audioService.deleteRecording(recordingResult.uri);
              }
            }
          }
        ]
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      setRecordingResult(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <Header 
        title="SpeakTrue" 
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text>⚙️</Text>
          </TouchableOpacity>
        }
        showBackButton={false}
      />

      {/* Status Label */}
      <View style={styles.statusContainer}>
        {isListening && (
          <Text style={styles.statusText}>Listening…</Text>
        )}
        {isProcessing && (
          <Text style={styles.statusText}>{processingStatus || 'Processing…'}</Text>
        )}
        {!isListening && !isProcessing && user && (
          <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
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
            onPress={isListening ? handleProcessAudio : handleListen}
            disabled={isProcessing}
          >
            <Text style={[styles.buttonText, isListening && styles.buttonTextActive]}>
              {isProcessing ? 'Processing...' : isListening ? 'Stop & Analyze' : 'Start Listening'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Instruction Text */}
        <Text style={styles.instructionText}>
          {isListening 
            ? 'Speak naturally, then tap to stop and get advice'
            : isProcessing 
            ? 'Analyzing your conversation...'
            : 'Tap to start recording your conversation'
          }
        </Text>
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
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '400',
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
  instructionText: {
    marginTop: 30,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
}); 