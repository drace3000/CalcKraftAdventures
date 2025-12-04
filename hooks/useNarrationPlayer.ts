import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { encode as btoa } from 'base-64';

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

export const useNarrationPlayer = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const fileRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const cleanupFile = useCallback(async () => {
    if (fileRef.current) {
      try {
        await FileSystem.deleteAsync(fileRef.current, { idempotent: true });
      } catch {
        // Ignore cleanup failures
      } finally {
        fileRef.current = null;
      }
    }
  }, []);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch {
        // Ignore stop failures (e.g., sound already stopped)
      }
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // Ignore unload failures
      }
      soundRef.current = null;
    }

    await cleanupFile();
    setIsPlaying(false);
  }, [cleanupFile]);

  const playFromBuffer = useCallback(
    async (buffer: ArrayBuffer) => {
      await stop();

      const base64 = arrayBufferToBase64(buffer);
      const fileUri = `${FileSystem.cacheDirectory}narration-${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: 'base64',
      });
      fileRef.current = fileUri;

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true },
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        const castStatus = status as AVPlaybackStatusSuccess;

        if (!castStatus.isLoaded) {
          return;
        }

        if (castStatus.didJustFinish) {
          stop();
        }
      });
    },
    [stop],
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    playFromBuffer,
    stop,
  };
};

