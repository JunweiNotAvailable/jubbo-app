import { RecordingResult } from '../services/audioService';

export type RootStackParamList = {
  Home: undefined;
  Advices: { recordingResult?: RecordingResult };
  Settings: undefined;
}; 