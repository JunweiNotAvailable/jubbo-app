import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface RecordingResult {
  uri: string;
  duration: number;
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private recordingStartTime: number = 0;

  async requestPermissions(): Promise<{ granted: boolean; message: string }> {
    try {
      console.log('Requesting audio recording permissions...');
      const permissionResponse = await Audio.requestPermissionsAsync();
      
      console.log('Permission response:', permissionResponse);
      
      if (permissionResponse.status === 'granted') {
        return { granted: true, message: 'Permission granted' };
      } else if (permissionResponse.status === 'denied') {
        return { 
          granted: false, 
          message: 'Microphone permission was denied. Please enable it in your device settings.' 
        };
      } else if (permissionResponse.status === 'undetermined') {
        return { 
          granted: false, 
          message: 'Microphone permission is undetermined. Please try again.' 
        };
      } else {
        return { 
          granted: false, 
          message: `Unknown permission status: ${permissionResponse.status}` 
        };
      }
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
      return { 
        granted: false, 
        message: `Permission request failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async startRecording(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Starting recording process...');
      
      // Request permissions first
      const permissionResult = await this.requestPermissions();
      if (!permissionResult.granted) {
        return { success: false, message: permissionResult.message };
      }

      console.log('Permissions granted, configuring audio mode...');

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Audio mode configured, creating recording...');

      // Create and configure recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      
      console.log('Recording started successfully');
      return { success: true, message: 'Recording started successfully' };
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      this.recording = null;
      return { 
        success: false, 
        message: `Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async stopRecording(): Promise<RecordingResult | null> {
    try {
      if (!this.recording || !this.isRecording) {
        return null;
      }

      console.log('Stopping recording...');
      await this.recording.stopAndUnloadAsync();
      
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      
      this.isRecording = false;
      this.recording = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      if (!uri) {
        throw new Error('Recording URI is null');
      }

      const duration = Date.now() - this.recordingStartTime;
      console.log('Recording stopped successfully');
      console.log('Recording duration:', duration, 'ms');
      
      return {
        uri,
        duration: duration, // Use our calculated duration instead of status.durationMillis
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
      console.log('Recording deleted:', uri);
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

// Export singleton instance
export const audioService = new AudioService();
export default audioService;