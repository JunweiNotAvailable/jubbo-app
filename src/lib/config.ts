const DEV_URL = 'http://192.168.1.104:3000'; // 192.168.1.104, 172.20.10.3
const PROD_URL = 'https://api.speaktruevision.com';

export const API_URL = process.env.EXPO_PUBLIC_ENV === 'production' ? PROD_URL : DEV_URL;

export const Config = {
  apiUrl: API_URL,
}; 