import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../lib/types';
import { AdviceModel } from '../lib/models';

type AdvicesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Advices'>;
type AdvicesScreenRouteProp = RouteProp<RootStackParamList, 'Advices'>;

interface Props {
  navigation: AdvicesScreenNavigationProp;
  route: AdvicesScreenRouteProp;
}

export default function AdvicesScreen({ navigation, route }: Props) {
  const [advices, setAdvices] = useState<AdviceModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { recordingResult } = route.params || {};

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      if (recordingResult) {
        // TODO: Get AI-generated suggestions based on the recording
      } else {
        // Fallback to mock data if no recording
        const mockAdvice: AdviceModel = {
            id: '1',
            user_id: '1',
            audio_url: 'https://example.com/audio.mp3',
            data: {
              scenario: 'I understand',
              context_summary: 'That makes sense',
              user_intent: 'I hear you',
              advice: {
                full_responses: [{
                  response: "I understand your perspective and appreciate you sharing that with me.",
                  tone: "Empathetic",
                  why: "Show genuine interest in understanding their viewpoint.",
                }],
                word_suggestions: [{
                  instead_of: "I understand",
                  use: "That makes sense",
                  context: "When to use this",
                }],
                tone_guidance: {
                  recommended_tone: "Empathetic",
                  voice_tips: "Show genuine interest in understanding their viewpoint.",
                  body_language: "Use body language to show genuine interest in understanding their viewpoint.",
                },
                conversation_strategy: {
                  immediate_goal: "Find a solution that works for both of us.",
                  long_term_approach: "Work together to find a solution that works for both of us.",
                },
              },
              personalization_notes: "Show genuine interest in understanding their viewpoint.",
            },
            created_at: new Date().toISOString(),
        };
        setAdvices([mockAdvice]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Fallback to empty suggestions
      setAdvices([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Communication Advice</Text>
      </View>

      {/* Loading or Suggestions List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Analyzing conversation...</Text>
        </View>
      ) : (
        <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
          {advices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No suggestions available at the moment.</Text>
            </View>
          ) : (
            advices.map((advice) => (
              <View key={advice.id} style={styles.suggestionCard}>
            <View style={styles.phrasesSection}>
              <Text style={styles.sectionTitle}>Quick Phrases:</Text>
              {advice.data.advice.full_responses.map((phrase, index) => (
                <Text key={index} style={styles.phrase}>• {phrase.response}</Text>
              ))}
            </View>
            
            <View style={styles.responseSection}>
              <Text style={styles.sectionTitle}>Suggested Response:</Text>
              <Text style={styles.response}>{advice.data.advice.full_responses[0].response}</Text>
            </View>
            
            <View style={styles.mindsetSection}>
              <Text style={styles.sectionTitle}>Mindset & Tone:</Text>
              <Text style={styles.mindset}>{advice.data.advice.tone_guidance.recommended_tone}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  pageTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginRight: 50, // Balance for back button
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  suggestionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phrasesSection: {
    marginBottom: 16,
  },
  responseSection: {
    marginBottom: 16,
  },
  mindsetSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  phrase: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
    paddingLeft: 8,
  },
  response: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  mindset: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 