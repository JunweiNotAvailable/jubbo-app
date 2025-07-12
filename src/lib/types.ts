import { RecordingResult } from './audio';

export type RootStackParamList = {
  Home: undefined;
  Advices: { recordingResult?: RecordingResult };
  Settings: undefined;
};