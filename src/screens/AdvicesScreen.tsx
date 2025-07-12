import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { apiService, ConversationSuggestion } from '../services/apiService';

type AdvicesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Advices'>;
type AdvicesScreenRouteProp = RouteProp<RootStackParamList, 'Advices'>;

interface Props {
  navigation: AdvicesScreenNavigationProp;
  route: AdvicesScreenRouteProp;
}

export default function AdvicesScreen({ navigation, route }: Props) {
  const [suggestions, setSuggestions] = useState<ConversationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { recordingResult } = route.params || {};

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      if (recordingResult) {
        // Get AI-generated suggestions based on the recording
        const aiSuggestions = await apiService.getSuggestions(recordingResult);
        setSuggestions(aiSuggestions);
      } else {
        // Fallback to mock data if no recording
        const mockSuggestions: ConversationSuggestion[] = [
          {
            id: '1',
            phrases: ["I understand", "That makes sense", "I hear you"],
            response: "I understand your perspective and appreciate you sharing that with me.",
            mindset: "Empathetic, open-minded, and validating. Show genuine interest in understanding their viewpoint.",
            timestamp: Date.now(),
          },
          {
            id: '2',
            phrases: ["Let me think about that", "That's interesting", "Can you tell me more?"],
            response: "That's an interesting point. Can you help me understand more about your reasoning behind that?",
            mindset: "Curious and thoughtful. Demonstrate active listening and genuine interest in learning more.",
            timestamp: Date.now(),
          },
          {
            id: '3',
            phrases: ["I appreciate that", "Thank you for sharing", "That's valuable"],
            response: "Thank you for sharing that insight with me. I really appreciate your honesty.",
            mindset: "Grateful and respectful. Acknowledge the effort they put into communicating with you.",
            timestamp: Date.now(),
          },
          {
            id: '4',
            phrases: ["Let's work together", "We can figure this out", "What if we tried"],
            response: "Let's work together to find a solution that works for both of us. What if we tried approaching it from a different angle?",
            mindset: "Collaborative and solution-focused. Frame challenges as shared problems to solve together.",
            timestamp: Date.now(),
          }
        ];
        setSuggestions(mockSuggestions);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Fallback to empty suggestions
      setSuggestions([]);
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
          {suggestions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No suggestions available at the moment.</Text>
            </View>
          ) : (
            suggestions.map((suggestion) => (
              <View key={suggestion.id} style={styles.suggestionCard}>
            <View style={styles.phrasesSection}>
              <Text style={styles.sectionTitle}>Quick Phrases:</Text>
              {suggestion.phrases.map((phrase, index) => (
                <Text key={index} style={styles.phrase}>• {phrase}</Text>
              ))}
            </View>
            
            <View style={styles.responseSection}>
              <Text style={styles.sectionTitle}>Suggested Response:</Text>
              <Text style={styles.response}>{suggestion.response}</Text>
            </View>
            
            <View style={styles.mindsetSection}>
              <Text style={styles.sectionTitle}>Mindset & Tone:</Text>
              <Text style={styles.mindset}>{suggestion.mindset}</Text>
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