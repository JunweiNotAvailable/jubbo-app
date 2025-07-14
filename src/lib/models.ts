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

export interface AdviceModel {
  id: string;
  user_id: string;
  created_at: string;
  audio_url: string;
  data: AdviceData;
}

export interface AdviceData {
  responses: {
    response: string;
    why: string;
  }[];
}