import { RecordingResult } from './audio';
import { AdviceModel } from './models';

export type RootStackParamList = {
  Home: undefined;
  Advices: { 
    result?: RecordingResult;
    advice?: AdviceModel;
  };
  Settings: undefined;
};