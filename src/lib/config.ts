const DEV_URL = 'http://localhost:3000';
const PROD_URL = 'https://api.speaktruevision.com';

export const API_URL = process.env.EXPO_PUBLIC_ENV === 'production' ? PROD_URL : DEV_URL;

export const CONFIG = {
  API_URL,
  ENDPOINTS: {
    DATA: '/api/data',
    AI: '/api/ai',
    HEALTH: '/api/health',
  },
  AI_ACTIONS: {
    ANALYZE_AUDIO: '/analyze-audio',
    ANALYZE_TEXT: '/analyze-text', 
    TRANSCRIBE: '/transcribe',
    ADVICE: '/advice',
  },
  TABLES: {
    USERS: 'users',
  },
}; 