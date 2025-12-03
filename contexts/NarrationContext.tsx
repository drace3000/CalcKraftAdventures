import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Constants from 'expo-constants';
import { THEME_DEFINITION_MAP, THEME_DEFINITIONS, ThemeId } from '@/constants/themeData';
import { synthesizeSpeech } from '@/services/elevenLabsClient';

type NarrationStatus = 'idle' | 'loading' | 'ready' | 'error';

type NarrationContextValue = {
  buffers: Record<ThemeId, ArrayBuffer | undefined>;
  status: Record<ThemeId, NarrationStatus>;
  prefetchNarration: (themeId: ThemeId) => Promise<ArrayBuffer | undefined>;
};

const NarrationContext = createContext<NarrationContextValue | undefined>(undefined);

const getVoiceIdForTheme = (themeId: ThemeId) => {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  switch (themeId) {
    case 'blockland':
      return extra.elevenLabsVoiceIdBlockland;
    case 'princess':
      return extra.elevenLabsVoiceIdPrincess ?? extra.elevenLabsVoiceIdBlockland;
    case 'unicorn':
      return extra.elevenLabsVoiceIdUnicorn ?? extra.elevenLabsVoiceIdBlockland;
    default:
      return undefined;
  }
};

export const NarrationProvider = ({ children }: { children: React.ReactNode }) => {
  const [buffers, setBuffers] = useState<Record<ThemeId, ArrayBuffer | undefined>>(
    {} as Record<ThemeId, ArrayBuffer | undefined>,
  );
  const [status, setStatus] = useState<Record<ThemeId, NarrationStatus>>(
    {} as Record<ThemeId, NarrationStatus>,
  );
  const requestsRef = useRef<Record<ThemeId, Promise<ArrayBuffer | undefined>>>(
    {} as Record<ThemeId, Promise<ArrayBuffer | undefined>>,
  );

  const prefetchNarration = useCallback(
    async (themeId: ThemeId) => {
      if (buffers[themeId]) {
        return buffers[themeId];
      }
      if (requestsRef.current[themeId]) {
        return requestsRef.current[themeId];
      }

      const theme = THEME_DEFINITION_MAP[themeId];
      if (!theme) {
        console.warn(`Theme ${themeId} is not registered for narration.`);
        setStatus((prev) => ({ ...prev, [themeId]: 'error' }));
        return undefined;
      }

      setStatus((prev) => ({ ...prev, [themeId]: 'loading' }));

      const request = synthesizeSpeech(theme.narration, {
        voiceId: getVoiceIdForTheme(theme.voicePreference ?? theme.id),
        latencyOptimization: 1,
      })
        .then((buffer) => {
          setBuffers((prev) => ({ ...prev, [themeId]: buffer }));
          setStatus((prev) => ({ ...prev, [themeId]: 'ready' }));
          return buffer;
        })
        .catch((error) => {
          console.error(`Failed to prefetch narration for ${themeId}`, error);
          setStatus((prev) => ({ ...prev, [themeId]: 'error' }));
          return undefined;
        })
        .finally(() => {
          requestsRef.current[themeId] = undefined;
        });

      requestsRef.current[themeId] = request;
      return request;
    },
    [buffers],
  );

  useEffect(() => {
    THEME_DEFINITIONS.forEach((theme) => {
      prefetchNarration(theme.id);
    });
  }, [prefetchNarration]);

  const value = useMemo(
    () => ({
      buffers,
      status,
      prefetchNarration,
    }),
    [buffers, status, prefetchNarration],
  );

  return <NarrationContext.Provider value={value}>{children}</NarrationContext.Provider>;
};

export const useNarrations = () => {
  const context = useContext(NarrationContext);
  if (!context) {
    throw new Error('useNarrations must be used within a NarrationProvider');
  }

  return context;
};

