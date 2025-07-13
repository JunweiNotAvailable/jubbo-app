export interface UserModel {
  id: string;
  name: string;
  email: string;
  created_at: string;
  settings: UserSettings;
}

export interface UserSettings {
  // TODO: Add user settings
}

export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  token: string;
}

export interface AdviceModel {
  id: string;
  user_id: string;
  created_at: string;
  audio_url: string;
  data: AdviceData;
}

export interface AdviceData {
  scenario: string;
  context_summary: string;
  user_intent: string;
  advice: {
    full_responses: {
      response: string;
      tone: string;
      why: string;
    }[];
    word_suggestions: {
      instead_of: string;
      use: string;
      context: string;
    }[];
    tone_guidance: {
      recommended_tone: string;
      voice_tips: string;
      body_language: string;
    };
    conversation_strategy: {
      immediate_goal: string;
      long_term_approach: string;
    };
  };
  personalization_notes: string;
}