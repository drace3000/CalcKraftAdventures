import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
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

const selectThemeBackground = require('@/assets/images/CalcKraft-Select-Theme-Background.png');
const blocklandIcon = require('@/assets/images/CalcKraft-BlockLand-Small.png');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const themes = [
  {
    id: 'blockland',
    title: 'Blockland',
    image: blocklandIcon,
    accent: '#FFB300',
  },
  {
    id: 'princess',
    title: 'Princess Castle',
    image: null,
    accent: '#EC407A',
  },
  {
    id: 'unicorn',
    title: 'Unicorn Meadow',
    image: null,
    accent: '#7E57C2',
  },
];

export default function ThemeSelectScreen() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const blocklandScale = useRef(new Animated.Value(1)).current;

  return (
    <ImageBackground source={selectThemeBackground} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={20} color="#4E342E" />
          <Text style={styles.backText}>Back to Camp</Text>
        </TouchableOpacity>

        <View style={styles.heroCopy}>
          <Text style={styles.screenTitle}>Select A Hero Theme</Text>
          <Text style={styles.subtitle}>
            Choose a realm and we’ll tailor your quests with matching sparkle, sounds, and treasure.
          </Text>
        </View>

        <View style={styles.flexSpacer} />

        <View style={styles.buttonRow}>
          {themes.map((theme) => {
            const isActive = theme.id === selectedTheme;
            if (theme.image) {
              const animatedScale = theme.id === 'blockland'
                ? blocklandScale
                : useMemo(() => new Animated.Value(1), []);

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

              return (
                <AnimatedPressable
                  key={theme.id}
                  style={[styles.themeIconPressable, { transform: [{ scale: animatedScale }] }]}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => setSelectedTheme(theme.id)}
                  android_ripple={{ color: 'transparent' }}>
                  <Image source={theme.image} style={styles.themeImage} resizeMode="contain" />
                </AnimatedPressable>
              );
            }

            return (
              <TouchableOpacity
                key={theme.id}
                activeOpacity={0.9}
                style={[
                  styles.themeButton,
                  { borderColor: theme.accent },
                  isActive && styles.themeButtonActive,
                ]}
                onPress={() => setSelectedTheme(theme.id)}>
                <Ionicons name="sparkles" size={32} color={theme.accent} />
                <Text style={styles.themeLabel}>{theme.title}</Text>
              </TouchableOpacity>
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

