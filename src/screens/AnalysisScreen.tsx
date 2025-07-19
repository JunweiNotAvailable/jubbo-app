import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../lib/types';
import Header from '../components/Header';
import { Colors, FONTS } from '../lib/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoSvg } from '../components/Svgs';

type AnalysisScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

interface Props {
  navigation: AnalysisScreenNavigationProp;
  route: AnalysisScreenRouteProp;
}

export default function AnalysisScreen({ navigation, route }: Props) {
  const { analysis } = route.params || {};

  const title = "Meeting Analysis";

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />

        <Header
          title={title}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No available data</Text>
        </View>
      </SafeAreaView>
    )
  }

  const { input: meetingInput, data } = analysis;
  const ToneColor = (data.efficiency_score > 70) ? Colors.green :
    (data.efficiency_score > 50) ? Colors.blue :
      (data.efficiency_score > 30) ? Colors.gold :
        Colors.red;
  const ScoreColors = {
    low: Colors.red,
    medium: Colors.gold,
    high: Colors.green,
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <Header
        title={title}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Efficiency Score */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogoSvg fillBody={ToneColor} fillDetail={'#fff'} width={20} height={20} />
            <Text style={styles.sectionTitle}>Efficiency Score</Text>
          </View>
          <Text style={styles.sectionContentText}>{data.efficiency_score} / 100</Text>
        </View>

        {/* Meeting Duration Estimate */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogoSvg fillBody={ToneColor} fillDetail={'#fff'} width={20} height={20} />
            <Text style={styles.sectionTitle}>Meeting Duration (min)</Text>
          </View>
          <View style={styles.sectionContentRow}>
            <Text style={styles.sectionContentText}>Time: {meetingInput.total_time}</Text>
            <Text style={styles.sectionContentText}>Est: {data.meeting_duration_estimate}</Text>
            <Text style={styles.sectionContentText}>Wasted: {meetingInput.total_time - data.meeting_duration_estimate}</Text>
          </View>
        </View>

        {/* Key Issues */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogoSvg fillBody={ToneColor} fillDetail={'#fff'} width={20} height={20} />
            <Text style={styles.sectionTitle}>Key Issues</Text>
          </View>
          {data.key_issues.map((issue, index) => (
            <View key={index} style={styles.sectionContentItem}>
              <Text style={[styles.sectionContentText, { fontFamily: FONTS.bold, marginBottom: 8, textTransform: 'capitalize' }]}>{issue.type}</Text>
              <Text style={[styles.sectionContentText, { marginBottom: 5, marginLeft: 10 }]}><Text style={{ fontFamily: FONTS.bold }}>• Detail: </Text>{issue.description}</Text>
              <Text style={[styles.sectionContentText, { marginBottom: 5, marginLeft: 10 }]}><Text style={{ fontFamily: FONTS.bold }}>• Improvement: </Text>{issue.improvement}</Text>
            </View>
          ))}
        </View>

        {/* Conversation Analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogoSvg fillBody={ToneColor} fillDetail={'#fff'} width={20} height={20} />
            <Text style={styles.sectionTitle}>Conversation Aspects</Text>
          </View>
          <View>
            <Text style={styles.sectionContentText}>Topic Focus: <Text style={{ fontFamily: FONTS.bold, color: ScoreColors[data.conversation_aspects.topic_focus as keyof typeof ScoreColors] }}>{data.conversation_aspects.topic_focus}</Text></Text>
            <Text style={styles.sectionContentText}>Decision Clarity: <Text style={{ fontFamily: FONTS.bold, color: ScoreColors[data.conversation_aspects.decision_clarity as keyof typeof ScoreColors] }}>{data.conversation_aspects.decision_clarity}</Text></Text>
            <Text style={styles.sectionContentText}>Participant Engagement: <Text style={{ fontFamily: FONTS.bold, color: ScoreColors[data.conversation_aspects.participant_engagement as keyof typeof ScoreColors] }}>{data.conversation_aspects.participant_engagement}</Text></Text>
            <Text style={styles.sectionContentText}>Interruption Level: <Text style={{ fontFamily: FONTS.bold, color: ScoreColors[data.conversation_aspects.interruption_level as keyof typeof ScoreColors] }}>{data.conversation_aspects.interruption_level}</Text></Text>
          </View>
        </View>

        {/* Decisions and Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogoSvg fillBody={ToneColor} fillDetail={'#fff'} width={20} height={20} />
            <Text style={styles.sectionTitle}>Decisions and Actions</Text>
          </View>
          <View>
            <Text style={[styles.sectionContentText, { fontFamily: FONTS.bold, marginBottom: 8 }]}>Clear Decisions ({data.decisions_actions_problems.clear_decisions.length})</Text>
            {data.decisions_actions_problems.clear_decisions?.map((decision, index) => (
              <Text key={index} style={[styles.sectionContentText, { marginBottom: 5, marginLeft: 10 }]}>• {decision}</Text>
            ))}

            <Text style={[styles.sectionContentText, { fontFamily: FONTS.bold, marginTop: 15, marginBottom: 8 }]}>Action Items ({data.decisions_actions_problems.action_items.length})</Text>
            {data.decisions_actions_problems.action_items?.map((item, index) => (
              <Text key={index} style={[styles.sectionContentText, { marginBottom: 5, marginLeft: 10 }]}>• {item}</Text>
            ))}

            <Text style={[styles.sectionContentText, { fontFamily: FONTS.bold, marginTop: 15, marginBottom: 8 }]}>Unresolved Problems ({data.decisions_actions_problems.unresolved_problems.length})</Text>
            {data.decisions_actions_problems.unresolved_problems?.map((issue, index) => (
              <Text key={index} style={[styles.sectionContentText, { marginBottom: 5, marginLeft: 10 }]}>• {issue}</Text>
            ))}
          </View>
        </View>

        {/* Improvement Suggestions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogoSvg fillBody={ToneColor} fillDetail={'#fff'} width={20} height={20} />
            <Text style={styles.sectionTitle}>Improvement Suggestions</Text>
          </View>
          {data.improvement_suggestions.map((suggestion, index) => (
            <Text key={index} style={[styles.sectionContentText, { marginBottom: 8, marginLeft: 10 }]}>• {suggestion}</Text>
          ))}
        </View>

        {/* Meeting Roast */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogoSvg fillBody={ToneColor} fillDetail={'#fff'} width={20} height={20} />
            <Text style={styles.sectionTitle}>Meeting Roast</Text>
          </View>
          <Text style={[styles.sectionContentText, { fontStyle: 'italic', lineHeight: 22 }]}>{data.meeting_roast}</Text>
        </View>

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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  sectionTitle: {
    marginTop: 4,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  sectionContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionContentItem: {
    marginBottom: 5,
  },
  sectionContentText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: Colors.gray,
  },
  sectionContentSubtitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 14,
    color: Colors.gray,
    textTransform: 'capitalize',
    marginBottom: 5,
  },
}); 