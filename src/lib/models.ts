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
  input: string;
  data: AdviceData;
}

export interface AdviceData {
  response: {
    positive: Response,
    questioning: Response,
    pushback: Response,
    redirect: Response,
  };
}

interface Response {
  response: string;
  why: string;
}