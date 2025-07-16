import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../lib/types';
import { audioService, RecordingResult } from '../lib/audio';
import { useAppContext } from '../contexts/AppContext';
import { Config } from '../lib/config';
import { generateId } from '../lib/functions';
import { AdviceModel, AdviceData } from '../lib/models';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { APP_NAME, Colors, FONTS } from '../lib/constants';
import Loader from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TempNameScreen from './TempNameScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAppContext();
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [selectedModel, setSelectedModel] = useState<string>('gemini');

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isListening]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const settings = await AsyncStorage.getItem('customization');
        if (settings) {
          const { selectedModel } = JSON.parse(settings);
          setSelectedModel(selectedModel || 'gemini-2.0-flash-exp');
        }
      } catch (error) {
        console.error('Error loading model setting:', error);
      }
    };
    loadModel();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
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
      console.log(Config.apiUrl);
      
      // Step 1: Stop recording and get audio file
      const result = await audioService.stopRecording();
      
      if (!result || !result.uri) {
        throw new Error('Failed to stop recording or no audio recorded');
      }
      
      setRecordingResult(result);
      
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
      
      // Add selected AI model
      formData.append('model', selectedModel);
      
      // Step 3: Send audio to server for complete analysis (transcription + advice)
      console.log('Sending audio to server for analysis...');
      console.log('Using AI model:', selectedModel);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for AI processing
      
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
        
        // Step 4: Create complete AdviceModel
        const adviceModel: AdviceModel = {
          id: generateId('advice'),
          user_id: user?.id || '',
          created_at: new Date().toISOString(),
          audio_url: result.uri, // Store local URI for now
          data: analysisData.data.advice as AdviceData,
        };
        
        // Step 5: Navigate to advice screen immediately for better UX
        navigation.navigate('Advices', { 
          result: result,
          advice: adviceModel,
        });
        
        // Step 6: Save advice to database in background (non-blocking)
        if (user) {
          // Fire and forget - save to database without blocking UI
          fetch(`${Config.apiUrl}/api/data/advices`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(adviceModel),
          })
          .then(saveResponse => {
            if (saveResponse.ok) {
              console.log('Advice saved to database successfully');
            } else {
              console.warn('Failed to save advice to database');
            }
          })
          .catch(saveError => {
            console.error('Error saving advice to database:', saveError);
          });
        }
        
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
      setRecordingResult(null);
    }
  };

  if (!user?.name) {
    return <TempNameScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <Header 
        title={APP_NAME} 
        titleStyle={{ color: '#fff', fontSize: 28, fontFamily: FONTS.black }}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="person-circle-outline" size={28} color={'#fff'} />
          </TouchableOpacity>
        }
        showBackButton={false}
      />

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
          <View style={[styles.iconContainer]}>
            <Image
              source={require('../../assets/logo-white.png')}
              style={[styles.icon]}
            />
          </View>
          <TouchableOpacity 
            style={styles.buttonTouchable}
            onPress={isListening ? handleProcessAudio : handleListen}
            disabled={isProcessing}
          >
            {isProcessing && <View style={{ marginBottom: 10 }}><Loader color='#fffc' size={24} strokeWidth={3} /></View>}
            <Text style={[styles.buttonText, (isListening || isProcessing) && styles.buttonTextActive]}>
              {isProcessing ? 'Thinking...' : isListening ? 'Listening...' : 'Tap to Listen'}
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
    backgroundColor: Colors.primary,
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
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#fff4',
    borderWidth: 4,
    borderColor: Colors.primary + '44',
    shadowColor: '#fff',
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
    borderRadius: 120,
  },
  listeningButtonActive: {
    backgroundColor: '#fff3',
  },
  listeningButtonProcessing: {
    backgroundColor: '#fff2',
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  buttonTextActive: {
    color: '#fffa',
  },
  instructionText: {
    marginTop: 30,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: 0.2,
  },
  icon: {
    width: 100,
    height: 100,
  },
}); 