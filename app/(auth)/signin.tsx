import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Animated,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';

const splashArtwork = require('@/assets/images/calckraft-login-v2.png');

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, setAuthRedirectSuspended } = useAuth();
  const drag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const successHoldTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successHoldTimeout.current) {
        clearTimeout(successHoldTimeout.current);
      }
    };
  }, []);

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
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          bounciness: 12,
        }).start();
      },
    }),
  ).current;

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid adventurer email.');
      setStatusMessage({ text: 'Invalid email format.', type: 'error' });
      return false;
    }
    if (!password) {
      setError('Please enter your secret password.');
      setStatusMessage({ text: 'Password cannot be empty.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setStatusMessage(null);
    if (!validateForm()) return;

    setAuthRedirectSuspended(true);
    try {
      setLoading(true);
      await signIn(email.trim(), password);
      setStatusMessage({ text: 'Success! Quest initiated.', type: 'success' });
      if (successHoldTimeout.current) {
        clearTimeout(successHoldTimeout.current);
      }
      successHoldTimeout.current = setTimeout(() => {
        setAuthRedirectSuspended(false);
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        setError('No adventurer found. Please create your hero!');
        setStatusMessage({ text: 'No adventurer found.', type: 'error' });
      } else if (code === 'auth/wrong-password') {
        setError('Secret password incorrect. Try again.');
        setStatusMessage({ text: 'Secret password incorrect.', type: 'error' });
      } else {
        setError(err?.message ?? 'Unable to start quest. Try again.');
        setStatusMessage({ text: 'Something went wrong. Try again.', type: 'error' });
      }
      setAuthRedirectSuspended(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={splashArtwork} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Animated.View
            style={[styles.panelWrapper, { transform: [{ translateX: drag.x }, { translateY: drag.y }] }]}
            {...panResponder.panHandlers}>
            <View style={styles.panel}>
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" color="#B71C1C" size={18} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <InputRow
              icon="cube"
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
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            {statusMessage ? (
              <View
                style={[
                  styles.statusBanner,
                  statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    statusMessage.type === 'success' ? styles.statusSuccessText : styles.statusErrorText,
                  ]}>
                  {statusMessage.text}
                </Text>
              </View>
            ) : null}

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
                  <Text style={styles.buttonText}>START YOUR QUEST! (SIGN IN)</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.replace('/(auth)/signup')}
              disabled={loading}>
              <Text style={styles.linkText}>New here? CREATE YOUR HERO! (SIGN UP)</Text>
            </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

interface InputRowProps extends React.ComponentProps<typeof TextInput> {
  icon: keyof typeof Ionicons.glyphMap;
}

function InputRow({ icon, style, ...rest }: InputRowProps) {
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
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
  },
  panelWrapper: {
    width: '100%',
    marginTop: 120,
  },
  panel: {
    width: '100%',
    backgroundColor: 'rgba(240,210,170,0.7)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 6,
    borderColor: '#7b5a38',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
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
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#4E342E',
    fontWeight: '700',
  },
  statusBanner: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  statusSuccess: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderColor: '#2E7D32',
  },
  statusError: {
    backgroundColor: 'rgba(239,83,80,0.15)',
    borderColor: '#C62828',
  },
  statusText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  statusSuccessText: {
    color: '#1B5E20',
  },
  statusErrorText: {
    color: '#B71C1C',
  },
});

