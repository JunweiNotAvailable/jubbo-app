import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../lib/types';
import Header from '../components/Header';
import { FONTS } from '../lib/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

type AdvicesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Advices'>;
type AdvicesScreenRouteProp = RouteProp<RootStackParamList, 'Advices'>;

interface Props {
  navigation: AdvicesScreenNavigationProp;
  route: AdvicesScreenRouteProp;
}

export default function AdvicesScreen({ navigation, route }: Props) {
  const { advice } = route.params || {};

  const title = "Suggestions"

  if (!advice) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <Header
          title={title}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No advice data available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { data } = advice;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <Header
        title={title}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Section 1: Full Response (Single Card) */}
        {Object.entries(data.response).map(([tone, response], index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{tone}</Text>
            <View style={styles.responseCard}>
              <Text style={styles.responseText}>
                {response.response || 'No response available'}
              </Text>
              <Text style={styles.responseReason}>
                {response.why || ''}
              </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    textTransform: 'capitalize',
    fontFamily: FONTS.bold,
  },

  // Response Card (Section 1)
  responseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  responseText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
  },
  responseReason: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 18,
    fontFamily: FONTS.semiBold,
  },

  // Cards Grid (Sections 2 & 3)
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },

  // Word Cards (Section 2)
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxWidth: '80%',
  },
  wordCardTitle: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordCardTitleText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  wordCardSuggestionText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  wordCardSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Tone Cards (Section 3)
  toneCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toneCardTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  toneCardText: {
    fontSize: 14,
    lineHeight: 18,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
}); 