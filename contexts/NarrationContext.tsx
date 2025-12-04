import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { THEME_DEFINITION_MAP, THEME_DEFINITIONS, ThemeId } from '@/constants/themeData';
import { synthesizeSpeech } from '@/services/elevenLabsClient';
import { getThemeContent, ThemeContent } from '@/services/themeService';
import { useAuth } from '@/contexts/AuthContext';

type NarrationStatus = 'idle' | 'loading' | 'ready' | 'error';

type NarrationContextValue = {
  buffers: Record<ThemeId, ArrayBuffer | undefined>;
  status: Record<ThemeId, NarrationStatus>;
  prefetchNarration: (themeId: ThemeId) => Promise<ArrayBuffer | undefined>;
};

const NarrationContext = createContext<NarrationContextValue | undefined>(undefined);

export const NarrationProvider = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, user } = useAuth();
  const [buffers, setBuffers] = useState<Record<ThemeId, ArrayBuffer | undefined>>(
    {} as Record<ThemeId, ArrayBuffer | undefined>,
  );
  const [status, setStatus] = useState<Record<ThemeId, NarrationStatus>>(
    {} as Record<ThemeId, NarrationStatus>,
  );
  const requestsRef = useRef<Record<ThemeId, Promise<ArrayBuffer | undefined>>>(
    {} as Record<ThemeId, Promise<ArrayBuffer | undefined>>,
  );
  const themeResourceCacheRef = useRef<Record<ThemeId, ThemeContent | undefined>>(
    {} as Record<ThemeId, ThemeContent | undefined>,
  );
  const themeResourceRequestsRef = useRef<Record<ThemeId, Promise<ThemeContent> | undefined>>(
    {} as Record<ThemeId, Promise<ThemeContent> | undefined>,
  );
  const currentUserIdRef = useRef<string | null>(null);
  const currentDisplayNameRef = useRef<string | null>(null);

  // Get user's display name with fallback (never use email)
  const getUserDisplayName = useCallback(() => {
    return userProfile?.displayName || user?.displayName || 'Adventurer';
  }, [userProfile, user]);

  // Personalize narration text by replacing {name} placeholder
  const personalizeNarration = useCallback(
    (text: string): string => {
      const displayName = getUserDisplayName();
      return text.replace(/{name}/g, displayName);
    },
    [getUserDisplayName],
  );

  // Clear cached narrations when user or display name changes
  useEffect(() => {
    const currentUserId = user?.uid || null;
    const currentDisplayName = getUserDisplayName();
    
    const userIdChanged = currentUserIdRef.current !== null && currentUserIdRef.current !== currentUserId;
    const displayNameChanged = currentDisplayNameRef.current !== null && currentDisplayNameRef.current !== currentDisplayName;
    
    if (userIdChanged || displayNameChanged) {
      // User or display name changed - clear all cached buffers and resources
      setBuffers({} as Record<ThemeId, ArrayBuffer | undefined>);
      themeResourceCacheRef.current = {} as Record<ThemeId, ThemeContent | undefined>;
      setStatus({} as Record<ThemeId, NarrationStatus>);
    }
    
    currentUserIdRef.current = currentUserId;
    currentDisplayNameRef.current = currentDisplayName;
  }, [user?.uid, getUserDisplayName]);

  const ensureThemeResource = useCallback(async (themeId: ThemeId) => {
    if (themeResourceCacheRef.current[themeId]) {
      return themeResourceCacheRef.current[themeId]!;
    }

    if (!themeResourceRequestsRef.current[themeId]) {
      themeResourceRequestsRef.current[themeId] = getThemeContent(themeId)
        .then((resource) => {
          themeResourceCacheRef.current[themeId] = resource;
          return resource;
        })
        .finally(() => {
          themeResourceRequestsRef.current[themeId] = undefined;
        });
    }

    return themeResourceRequestsRef.current[themeId]!;
  }, []);

  const showErrorPopup = useCallback((message: string) => {
    Alert.alert('Narration unavailable', message);
  }, []);

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

      const runPrefetch = async () => {
        try {
          const resource = await ensureThemeResource(themeId);
          // Personalize the narration text before synthesis
          const personalizedText = personalizeNarration(resource.narration);

          const buffer = await synthesizeSpeech(personalizedText, {
            voiceId: resource.elevenLabsVoiceId,
            latencyOptimization: 1,
          });
          setBuffers((prev) => ({ ...prev, [themeId]: buffer }));
          setStatus((prev) => ({ ...prev, [themeId]: 'ready' }));
          return buffer;
        } catch (error) {
          console.error(`Failed to prefetch narration for ${themeId}`, error);
          setStatus((prev) => ({ ...prev, [themeId]: 'error' }));
          showErrorPopup(
            `We couldn't load the ${theme.title} narration. Please check your connection and try again.`,
          );
          return undefined;
        } finally {
          requestsRef.current[themeId] = undefined;
        }
      };

      const request = runPrefetch();
      requestsRef.current[themeId] = request;
      return request;
    },
    [buffers, ensureThemeResource, showErrorPopup, personalizeNarration],
  );

  // Prefetch narrations when user and userProfile are available
  useEffect(() => {
    if (user && userProfile !== null) {
      // Wait for userProfile to load before prefetching to ensure correct display name
      THEME_DEFINITIONS.forEach((theme) => {
        void prefetchNarration(theme.id);
      });
    }
  }, [prefetchNarration, user, userProfile]);

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

