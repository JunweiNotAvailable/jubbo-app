import { AudioRecorder, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { AudioQuality, IOSOutputFormat } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

export interface RecordingResult {
  uri: string;
  duration: number;
}

class AudioService {
  private recording: AudioRecorder | null = null;
  private isRecording = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await requestRecordingPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode for recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Create new recording with options
      const recordingOptions = {
        extension: '.m4a',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        isMeteringEnabled: true,
        android: {
          outputFormat: 'mpeg4' as const,
          audioEncoder: 'aac' as const,
        },
        ios: {
          outputFormat: IOSOutputFormat.MPEG4AAC,
          audioQuality: AudioQuality.HIGH,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      this.recording = new AudioRecorder(recordingOptions);
      await this.recording.prepareToRecordAsync();
      this.recording.record();
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<RecordingResult | null> {
    try {
      if (!this.recording || !this.isRecording) {
        return null;
      }

      await this.recording.stop();
      const uri = this.recording.uri;
      const status = this.recording.getStatus();
      
      this.isRecording = false;
      this.recording = null;

      // Reset audio mode
      await setAudioModeAsync({
        allowsRecording: false,
      });

      if (!uri) {
        throw new Error('Recording URI is null');
      }

      return {
        uri,
        duration: status.durationMillis || 0,
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      this.recording = null;
      return null;
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  async deleteRecording(uri: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(uri);
      return true;
    } catch (error) {
      console.error('Failed to delete recording:', error);
      return false;
    }
  }

  async getRecordingInfo(uri: string): Promise<FileSystem.FileInfo | null> {
    try {
      return await FileSystem.getInfoAsync(uri);
    } catch (error) {
      console.error('Failed to get recording info:', error);
      return null;
    }
  }
}

export const audioService = new AudioService();