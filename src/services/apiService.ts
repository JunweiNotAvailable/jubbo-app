import { RecordingResult } from './audioService';
import { UserPreferences } from '../screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConversationSuggestion {
  id: string;
  phrases: string[];
  response: string;
  mindset: string;
  context?: string;
  timestamp: number;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  duration: number;
}

export interface AnalysisRequest {
  audioUri: string;
  transcription?: string;
  userContext?: {
    personalityStyle?: string;
    conversationGoals?: string[];
    currentMood?: string;
  };
}

export interface AnalysisResponse {
  suggestions: ConversationSuggestion[];
  conversationAnalysis: {
    tone: string;
    emotion: string;
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  transcription: TranscriptionResult;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // For development, this could be localhost or your backend URL
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  async transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const response = await fetch(`${this.baseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Transcription error:', error);
      // Return mock data for now if API fails
      return {
        text: "I understand what you're saying, but I'm having trouble expressing my thoughts clearly right now.",
        confidence: 0.85,
        duration: 3000,
      };
    }
  }

  async analyzeConversation(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analysis error:', error);
      // Return mock suggestions if API fails
      return this.getMockSuggestions();
    }
  }

  async getSuggestions(recordingResult: RecordingResult): Promise<ConversationSuggestion[]> {
    try {
      // Get user preferences
      const userPreferences = await this.getUserPreferences();
      
      // First transcribe the audio
      const transcription = await this.transcribeAudio(recordingResult.uri);
      
      // Then analyze and get suggestions
      const analysis = await this.analyzeConversation({
        audioUri: recordingResult.uri,
        transcription: transcription.text,
        userContext: userPreferences,
      });

      return analysis.suggestions;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return this.getMockSuggestions().suggestions;
    }
  }

  private async getUserPreferences(): Promise<UserPreferences | undefined> {
    try {
      const stored = await AsyncStorage.getItem('userPreferences');
      return stored ? JSON.parse(stored) : undefined;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return undefined;
    }
  }

  private getMockSuggestions(): AnalysisResponse {
    return {
      suggestions: [
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
      ],
      conversationAnalysis: {
        tone: 'neutral',
        emotion: 'contemplative',
        topics: ['communication', 'understanding'],
        sentiment: 'neutral',
      },
      transcription: {
        text: "Mock transcription - the user was speaking about something important",
        confidence: 0.85,
        duration: 3000,
      },
    };
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const apiService = new ApiService();