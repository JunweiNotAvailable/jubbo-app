import { RecordingResult } from './audio';
import { AnalysisModel } from './models';

export type RootStackParamList = {
  Home: undefined;
  Analysis: { 
    result?: RecordingResult;
    analysis?: AnalysisModel;
  };
  Settings: undefined;
};