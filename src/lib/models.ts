export interface UserModel {
  id: string;
  name: string;
  email: string;
  created_at: string;
  settings?: UserSettings;
}

export interface UserSettings {
  // TODO: Add user settings
}

export interface AnalysisModel {
  id: string;
  user_id: string;
  created_at: string;
  input: {
    transcript: string;
    total_time: number;
  };
  data: AnalysisData;
}

export interface AnalysisData {
  efficiency_score: number;
  meeting_duration_estimate: number;
  key_issues: KeyIssue[];
  conversation_aspects: ConversationAspects;
  speaker_analysis: SpeakerAnalysis;
  decisions_actions_problems: DecisionsActionsProblems;
  improvement_suggestions: string[];
  meeting_roast: string;
}

export interface KeyIssue {
  type: string;
  description: string;
  improvement: string;
}

export interface ConversationAspects {
  topic_focus: 'high' | 'medium' | 'low';
  decision_clarity: 'high' | 'medium' | 'low';
  participant_engagement: 'high' | 'medium' | 'low';
  interruption_level: 'high' | 'medium' | 'low';
}

export interface DecisionsActionsProblems {
  clear_decisions: string[];
  action_items: string[];
  unresolved_problems: string[];
}

export interface SpeakerAnalysis {
  speaking_distribution: SpeakingDistribution[];
  interaction_patterns: InteractionPatterns;
}

export interface SpeakingDistribution {
  speaker: string;
  participation_level: 'high' | 'medium' | 'low';
  contribution_quality: 'high' | 'medium' | 'low';
  preparation_level: 'well-prepared' | 'moderately-prepared' | 'unprepared';
  key_behaviors: string[];
}

export interface InteractionPatterns {
  most_interruptions: string;
  meeting_leader: string;
  most_valuable_contributor: string;
  passive_participants: string[];
}