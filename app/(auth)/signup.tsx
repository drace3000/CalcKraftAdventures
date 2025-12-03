import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';

const heroArtwork = require('@/assets/images/calckraft-create-your-hero.png');
const backArtwork = require('@/assets/images/calckraft-back-v2.png');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp, signOut, setAuthRedirectSuspended } = useAuth();
  const insets = useSafeAreaInsets();
  const panelRestOffset = useRef(
    Platform.select({
      ios: Math.max(60, insets.bottom + 20),
      android: Math.max(80, insets.bottom + 40),
    }) ?? 80,
  );
  const drag = useRef(new Animated.ValueXY({ x: 0, y: panelRestOffset.current })).current;
  const backBounce = useRef(new Animated.Value(1)).current;
  const backWiggle = useRef(new Animated.Value(0)).current;
  const ctaDrag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const keyboardVisibleRef = useRef(false);
  const ctaStartPosition = useRef({ x: 0, y: 0 });
  const keyboardVerticalOffset =
    Platform.select({
      ios: insets.top + 48,
      android: insets.top + 20,
    }) ?? 0;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(backWiggle, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(backWiggle, { toValue: -1, duration: 1500, useNativeDriver: true }),
      ]).start(() => animate());
    };
    animate();
  }, [backWiggle]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      keyboardVisibleRef.current = true;
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      keyboardVisibleRef.current = false;
      ctaStartPosition.current = { x: 0, y: 0 };
      Animated.spring(ctaDrag, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [ctaDrag]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [
          null,
          {
            dx: drag.x,
            dy: drag.y,
          },
        ],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: () => {
        Animated.spring(drag, {
          toValue: { x: 0, y: panelRestOffset.current },
          useNativeDriver: false,
          bounciness: 12,
        }).start();
      },
    }),
  ).current;
  const ctaPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => keyboardVisibleRef.current,
      onMoveShouldSetPanResponder: () => keyboardVisibleRef.current,
      onPanResponderGrant: () => {
        ctaDrag.stopAnimation((value) => {
          if (typeof value === 'object' && value) {
            ctaStartPosition.current = {
              x: (value as { x: number }).x ?? ctaStartPosition.current.x,
              y: (value as { y: number }).y ?? ctaStartPosition.current.y,
            };
          }
        });
      },
      onPanResponderMove: (_, gestureState) => {
        ctaDrag.setValue({
          x: ctaStartPosition.current.x + gestureState.dx,
          y: ctaStartPosition.current.y + gestureState.dy,
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        ctaStartPosition.current = {
          x: ctaStartPosition.current.x + gestureState.dx,
          y: ctaStartPosition.current.y + gestureState.dy,
        };
      },
      onPanResponderTerminate: (_, gestureState) => {
        ctaStartPosition.current = {
          x: ctaStartPosition.current.x + gestureState.dx,
          y: ctaStartPosition.current.y + gestureState.dy,
        };
      },
    }),
  ).current;

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    if (!displayName.trim()) {
      setError('Please enter your adventurer name.');
      return false;
    }
    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid adventurer email.');
      return false;
    }
    if (password.length < 6) {
      setError('Secret password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Secret passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;

    setAuthRedirectSuspended(true);
    try {
      setLoading(true);
      await signUp(email.trim(), password, displayName.trim());
      await signOut();
      router.replace('/(auth)/signin');
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        setError('This adventurer already exists. Please start your quest by signing in.');
      } else if (code === 'auth/weak-password') {
        setError('Secret password is too weak. Add more magic!');
      } else {
        setError(err?.message ?? 'Unable to create hero. Try again.');
      }
    } finally {
      setLoading(false);
      setAuthRedirectSuspended(false);
    }
  };

  return (
    <ImageBackground source={heroArtwork} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <AnimatedPressable
        style={styles.globalBackButton}
        onPress={() => router.replace('/(auth)/signin')}
        onPressIn={() => Animated.spring(backBounce, { toValue: 1.1, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(backBounce, { toValue: 1, useNativeDriver: true }).start()}>
        <Animated.Image
          source={backArtwork}
          style={[
            styles.globalBackImage,
            {
              transform: [
                { scale: backBounce },
                { translateX: backWiggle.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] }) },
              ],
            },
          ]}
        />
      </AnimatedPressable>
      <Animated.View
        style={[styles.draggableContainer, { transform: [{ translateX: drag.x }, { translateY: drag.y }] }]}
        {...panResponder.panHandlers}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <View style={styles.panelWrapper}>
              <View style={styles.panel}>
                {error ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" color="#B71C1C" size={18} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <InputRow
                  icon="sparkles"
                  placeholder="ADVENTURER NAME"
                  value={displayName}
                  onChangeText={setDisplayName}
                  editable={!loading}
                />
                <InputRow
                  icon="mail"
                  placeholder="ADVENTURER EMAIL"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                <InputRow
                  icon="key"
                  placeholder="SECRET PASSWORD"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                  accessory={
                    <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#C75C02" />
                    </TouchableOpacity>
                  }
                />
                <InputRow
                  icon="lock-closed"
                  placeholder="CONFIRM PASSWORD"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                  accessory={
                    <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                      <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#C75C02" />
                    </TouchableOpacity>
                  }
                />

                <Animated.View
                  style={[
                    styles.ctaSection,
                    { transform: [{ translateX: ctaDrag.x }, { translateY: ctaDrag.y }] },
                  ]}
                  {...ctaPanResponder.panHandlers}>
                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    activeOpacity={0.9}
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Ionicons name="shield" size={22} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>CREATE HERO (SIGN UP)</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.replace('/(auth)/signin')}
                    disabled={loading}>
                    <Text style={styles.linkText}>Already have an account? START YOUR QUEST!</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </ImageBackground>
  );
}

interface InputRowProps extends React.ComponentProps<typeof TextInput> {
  icon: keyof typeof Ionicons.glyphMap;
  accessory?: React.ReactNode;
}

function InputRow({ icon, style, accessory, ...rest }: InputRowProps) {
  return (
    <View style={styles.inputRow}>
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={24} color="#C75C02" />
      </View>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#6d4c41"
        {...rest}
      />
      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 120,
    alignItems: 'center',
  },
  draggableContainer: {
    flex: 1,
  },
  panelWrapper: {
    width: '100%',
    marginTop: Platform.select({ ios: 120, android: 150 }),
  },
  panel: {
    width: '100%',
    backgroundColor: 'rgba(240,210,170,0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 4,
    borderColor: '#8D6E63',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  globalBackButton: {
    position: 'absolute',
    top: Platform.select({ ios: 30, android: 45 }),
    left: Platform.select({ ios: 12, android: 16 }),
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  globalBackImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F06292',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderColor: '#AD1457',
    marginBottom: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCDD2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  errorText: {
    marginLeft: 8,
    color: '#B71C1C',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8EBD6',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#8D6E63',
    paddingHorizontal: 12,
    minHeight: 56,
    marginBottom: 12,
  },
  iconBadge: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#4E342E',
    letterSpacing: 1,
  },
  accessory: {
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#2E7D32',
    paddingVertical: 14,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ctaSection: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#4E342E',
    fontWeight: '700',
  },
});

