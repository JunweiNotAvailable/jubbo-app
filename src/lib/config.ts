const DEV_URL = 'http://localhost:3000';
const PROD_URL = 'https://api.speaktruevision.com';

export const API_URL = process.env.EXPO_PUBLIC_ENV === 'production' ? PROD_URL : DEV_URL;

export const CONFIG = {
  API_URL,
  ENDPOINTS: {
    DATA: '/data',
    AI: '/ai',
    HEALTH: '/health',
  },
  AI_ACTIONS: {
    ANALYZE_AUDIO: '/analyze-audio',
    TRANSCRIBE: '/transcribe',
    ADVICE: '/advice',
  },
  TABLES: {
    USERS: 'users',
    ADVICES: 'advices',
  },
}; 