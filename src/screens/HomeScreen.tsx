import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../lib/types';
import { audioService, RecordingResult } from '../lib/audio';
import { useAppContext } from '../contexts/AppContext';
import { Config } from '../lib/config';
import { generateId } from '../lib/functions';
import { AnalysisModel, AnalysisData } from '../lib/models';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { APP_NAME, Colors, FONTS } from '../lib/constants';
import Loader from '../components/Loader';
import TempNameScreen from './TempNameScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoSvg } from '../components/Svgs';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAppContext();
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [pulseAnimation] = useState(new Animated.Value(1));

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isListening]);

  // Timer effect for recording duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isListening) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0); // Reset when not recording
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isListening]);

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
   * Format recording time for display
   * @param seconds - Total seconds recorded
   * @returns Formatted time string (mm:ss or hh:mm:ss)
   */
  const formatRecordingTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };



  /**
   * Start audio recording
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
   * Stop recording and process entire audio for analysis
   */
  const handleProcessAudio = async () => {
    try {
      setIsListening(false);
      setIsProcessing(true);
      
      console.log('Stopping recording and processing audio...');
      
      // Step 1: Stop recording and get the complete audio
      const result = await audioService.stopRecording();
      
      if (!result || !result.uri) {
        throw new Error('Failed to stop recording or no audio recorded');
      }
      
      setRecordingResult(result);
      
      // Step 2: Process entire audio file with transcription and analysis
      console.log('Processing complete audio file...');
      
      const formData = new FormData();
      formData.append('audio', {
        uri: result.uri,
        type: 'audio/m4a',
        name: 'meeting.m4a',
      } as any);
      
      // Add context information
      const settings = await AsyncStorage.getItem('meetingSettings');
      let teamInfo = '';
      let meetingInfo = '';
      
      if (settings) {
        const { teamInfo: savedTeamInfo, meetingInfo: savedMeetingInfo } = JSON.parse(settings);
        teamInfo = savedTeamInfo || '';
        meetingInfo = savedMeetingInfo || '';
      }
      
      formData.append('context', JSON.stringify({
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        duration: Math.ceil(recordingTime / 60), // Convert seconds to minutes
        teamInfo: teamInfo,
        meetingInfo: meetingInfo,
      }));
      
      formData.append('model', 'llama-4-scout');
      
      // Call the analyze-audio endpoint which handles both transcription and analysis
      const analysisResponse = await fetch(`${Config.apiUrl}/api/ai/analyze-audio`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || `Analysis failed: ${analysisResponse.status}`);
      }
      
      const analysisData = await analysisResponse.json();
      
      if (!analysisData.success) {
        throw new Error(analysisData.error || 'Analysis failed');
      }
      
      console.log('Analysis completed successfully');
      
      // Step 3: Create complete AnalysisModel
      const analysisModel: AnalysisModel = {
        id: generateId('analysis'),
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        input: {
          transcript: analysisData.data.transcription,
          total_time: Math.ceil(recordingTime / 60), // Convert seconds to minutes
        },
        data: analysisData.data.analysis as AnalysisData,
      };
      
      // Step 4: Navigate to analysis screen immediately for better UX
      navigation.navigate('Analysis', { 
        result: result,
        analysis: analysisModel,
      });
      
      // Step 5: Save analysis to database in background (non-blocking)
      if (user) {
        // Fire and forget - save to database without blocking UI
        fetch(`${Config.apiUrl}/api/data/analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(analysisModel),
        })
        .then(saveResponse => {
          if (saveResponse.ok) {
            console.log('Analysis saved to database successfully');
          } else {
            console.warn('Failed to save analysis to database');
          }
        })
        .catch(saveError => {
          console.error('Error saving analysis to database:', saveError);
        });
      }
      
      // Step 6: Clean up the recording file
      if (result.uri) {
        await audioService.deleteRecording(result.uri);
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
            <LogoSvg fillBody={'#fff'} fillDetail={Colors.primary} width={120} height={120} />
          </View>
          <TouchableOpacity 
            style={styles.buttonTouchable}
            onPress={isListening ? handleProcessAudio : handleListen}
            disabled={isProcessing}
          >
            {isProcessing && <View style={{ marginBottom: 10 }}><Loader color='#fffc' size={24} strokeWidth={3} /></View>}
            {isListening && (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.timerText}>
                  {formatRecordingTime(recordingTime)}
                </Text>
              </View>
            )}
            <Text style={[styles.buttonText, (isListening || isProcessing) && styles.buttonTextActive]}>
              {isProcessing ? 'Analyzing...' : isListening ? 'Recording...' : 'Tap to Record'}
            </Text>
            {isProcessing && <Text style={styles.processingText}>Please wait for a moment</Text>}
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
  processingText: {
    fontSize: 12,
    color: '#fffa',
    fontWeight: '400',
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginTop: 5,
  },
  timerText: {
    fontSize: 18,
    color: '#fffa',
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  chunkProcessingText: {
    fontSize: 14,
    color: '#fffa',
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginTop: 5,
  },
  chunkStatusText: {
    fontSize: 12,
    color: '#fffa',
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginTop: 2,
  },
}); 