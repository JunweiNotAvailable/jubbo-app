import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type AdvicesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Advices'>;

interface Props {
  navigation: AdvicesScreenNavigationProp;
}

interface Suggestion {
  id: number;
  phrases: string[];
  response: string;
  mindset: string;
}

export default function AdvicesScreen({ navigation }: Props) {
  // Mock suggestions data
  const suggestions: Suggestion[] = [
    {
      id: 1,
      phrases: ["I understand", "That makes sense", "I hear you"],
      response: "I understand your perspective and appreciate you sharing that with me.",
      mindset: "Empathetic, open-minded, and validating. Show genuine interest in understanding their viewpoint."
    },
    {
      id: 2,
      phrases: ["Let me think about that", "That's interesting", "Can you tell me more?"],
      response: "That's an interesting point. Can you help me understand more about your reasoning behind that?",
      mindset: "Curious and thoughtful. Demonstrate active listening and genuine interest in learning more."
    },
    {
      id: 3,
      phrases: ["I appreciate that", "Thank you for sharing", "That's valuable"],
      response: "Thank you for sharing that insight with me. I really appreciate your honesty.",
      mindset: "Grateful and respectful. Acknowledge the effort they put into communicating with you."
    },
    {
      id: 4,
      phrases: ["Let's work together", "We can figure this out", "What if we tried"],
      response: "Let's work together to find a solution that works for both of us. What if we tried approaching it from a different angle?",
      mindset: "Collaborative and solution-focused. Frame challenges as shared problems to solve together."
    }
  ];

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

      {/* Suggestions List */}
      <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
        {suggestions.map((suggestion) => (
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
        ))}
      </ScrollView>
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
}); 