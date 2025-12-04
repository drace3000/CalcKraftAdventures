import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNarrationPlayer } from '@/hooks/useNarrationPlayer';
import { useNarrations } from '@/contexts/NarrationContext';
import { THEME_DEFINITIONS, ThemeId } from '@/constants/themeData';

const selectThemeBackground = require('@/assets/images/CalcKraft-Select-Theme-Background.png');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const themes = THEME_DEFINITIONS;

export default function ThemeSelectScreen() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(null);
  const [narratingTheme, setNarratingTheme] = useState<ThemeId | null>(null);
  const [isNarrationLoading, setIsNarrationLoading] = useState(false);
  const { isPlaying, playFromBuffer, stop: stopNarration } = useNarrationPlayer();
  const { buffers, prefetchNarration } = useNarrations();
  const lastTapRef = useRef<number>(0);
  const pulseAnimationRefs = useRef<Partial<Record<ThemeId, Animated.CompositeAnimation | null>>>({});
  const activePulseThemeRef = useRef<ThemeId | null>(null);
  const animatedScales = useMemo(() => {
    return themes.reduce<Record<ThemeId, Animated.Value>>((acc, theme) => {
      acc[theme.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<ThemeId, Animated.Value>);
  }, []);
  const pulseScales = useMemo(() => {
    return themes.reduce<Record<ThemeId, Animated.Value>>((acc, theme) => {
      acc[theme.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<ThemeId, Animated.Value>);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setNarratingTheme(null);
      setIsNarrationLoading(false);
    }
  }, [isPlaying]);

  const startPulse = useCallback(
    (themeId: ThemeId) => {
      const pulseValue = pulseScales[themeId];
      if (!pulseValue) {
        return;
      }

      pulseAnimationRefs.current[themeId]?.stop();
      pulseValue.setValue(1);

      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      pulseAnimationRefs.current[themeId] = animation;
      animation.start();
    },
    [pulseScales],
  );

  const stopPulse = useCallback(
    (themeId: ThemeId) => {
      const pulseValue = pulseScales[themeId];
      if (!pulseValue) {
        return;
      }

      pulseAnimationRefs.current[themeId]?.stop();
      pulseAnimationRefs.current[themeId] = null;
      pulseValue.stopAnimation(() => {
        pulseValue.setValue(1);
      });
    },
    [pulseScales],
  );

  useEffect(() => {
    const activeTheme = activePulseThemeRef.current;
    const targetTheme = narratingTheme;

    if (activeTheme && activeTheme !== targetTheme) {
      stopPulse(activeTheme);
      activePulseThemeRef.current = null;
    }

    if (targetTheme && activeTheme !== targetTheme) {
      startPulse(targetTheme);
      activePulseThemeRef.current = targetTheme;
    }

    if (!targetTheme) {
      activePulseThemeRef.current = null;
    }
  }, [narratingTheme, startPulse, stopPulse]);

  useEffect(() => {
    return () => {
      (Object.keys(pulseScales) as ThemeId[]).forEach((themeId) => stopPulse(themeId));
    };
  }, [pulseScales, stopPulse]);

  const requestNarrationPlayback = useCallback(
    async (themeId: ThemeId) => {
      const cached = buffers[themeId] ?? (await prefetchNarration(themeId));
      if (!cached) {
        return false;
      }
      await playFromBuffer(cached);
      return true;
    },
    [buffers, playFromBuffer, prefetchNarration],
  );

  const handleThemePress = useCallback(
    async (themeId: ThemeId) => {
      const now = Date.now();
      const isDoubleTap = now - lastTapRef.current < 350;

      if (isDoubleTap) {
        if (narratingTheme === themeId || isNarrationLoading || isPlaying) {
          await stopNarration();
          setNarratingTheme(null);
          setIsNarrationLoading(false);
        } else {
          setNarratingTheme(themeId);
          setIsNarrationLoading(true);
          try {
            const played = await requestNarrationPlayback(themeId);
            if (!played) {
              throw new Error('Narration unavailable');
            }
          } catch (error) {
            console.error(`Unable to play ${themeId} narration`, error);
            setNarratingTheme(null);
          } finally {
            setIsNarrationLoading(false);
          }
        }

        lastTapRef.current = now;
        return;
      }

      setSelectedTheme(themeId);
      lastTapRef.current = now;
    },
    [isNarrationLoading, isPlaying, narratingTheme, requestNarrationPlayback, stopNarration],
  );

  return (
    <ImageBackground source={selectThemeBackground} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={20} color="#4E342E" />
          <Text style={styles.backText}>Back to Camp</Text>
        </TouchableOpacity>

        <View style={styles.flexSpacer} />

        <View style={styles.buttonRow}>
          {themes.map((theme) => {
            const isActive = theme.id === selectedTheme;
            const isNarrating = narratingTheme === theme.id;
            const animatedScale = animatedScales[theme.id] ?? new Animated.Value(1);
            const pulseScale = pulseScales[theme.id] ?? new Animated.Value(1);
            const combinedScale = Animated.multiply(animatedScale, pulseScale);
            const handlePressIn = () => {
              Animated.spring(animatedScale, {
                toValue: 0.92,
                useNativeDriver: true,
              }).start();
            };
            const handlePressOut = () => {
              Animated.spring(animatedScale, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            };

            if (theme.image) {
              return (
                <AnimatedPressable
                  key={theme.id}
                  style={[
                    styles.themeIconPressable,
                    isNarrating && styles.pulsingButton,
                    isNarrating && styles.pulsingGlow,
                    isNarrating && { shadowColor: theme.accent },
                    { transform: [{ scale: combinedScale }] },
                  ]}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => handleThemePress(theme.id)}
                  android_ripple={{ color: 'transparent' }}>
                  <Image source={theme.image} style={styles.themeImage} resizeMode="contain" />
                </AnimatedPressable>
              );
            }

            return (
              <AnimatedTouchableOpacity
                key={theme.id}
                activeOpacity={0.9}
                style={[
                  styles.themeButton,
                  { borderColor: theme.accent },
                  isActive && styles.themeButtonActive,
                  isNarrating && styles.pulsingButton,
                  isNarrating && styles.pulsingGlow,
                  isNarrating && { shadowColor: theme.accent, borderColor: theme.accent },
                  { transform: [{ scale: combinedScale }] },
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => handleThemePress(theme.id)}>
                <Ionicons name="sparkles" size={32} color={theme.accent} />
                <Text style={styles.themeLabel}>{theme.title}</Text>
              </AnimatedTouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !selectedTheme && styles.disabledButton]}
          disabled={!selectedTheme}
          onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>
            {selectedTheme ? `Let’s quest in ${themes.find((t) => t.id === selectedTheme)?.title}!` : 'Pick a theme to continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D7CCC8',
    marginBottom: 10,
  },
  backText: {
    marginLeft: 6,
    fontWeight: '700',
    color: '#4E342E',
  },
  heroCopy: {
    marginTop: 10,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FBE9E7',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    marginTop: 8,
    color: '#FFE0B2',
    fontWeight: '600',
    lineHeight: 18,
  },
  flexSpacer: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  themeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  themeImage: {
    width: 140,
    height: 140,
  },
  themeIconPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  pulsingButton: {
    zIndex: 5,
    elevation: 8,
  },
  pulsingGlow: {
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  blocklandShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
  themeLabel: {
    fontWeight: '900',
    color: '#4E342E',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  primaryButtonText: {
    textAlign: 'center',
    fontWeight: '900',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

