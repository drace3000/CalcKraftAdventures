import { useRouter } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';

const heroBackground = require('@/assets/images/calckraft-login-v2.png');

export default function HomeScreen() {
  const { userProfile, user, signOut } = useAuth();
  const router = useRouter();

  const displayName = userProfile?.displayName || user?.email || 'Adventurer';
  const joinedAt = userProfile?.createdAt
    ? userProfile.createdAt.toLocaleDateString()
    : 'Unknown';
  const lastLogin = userProfile?.lastLoginAt
    ? userProfile.lastLoginAt.toLocaleString()
    : 'Just now';

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <ImageBackground source={heroBackground} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.overline}>CalcKraft Adventures</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="exit-outline" size={18} color="#4E342E" />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heading}>Welcome back, {displayName}!</Text>
          <Text style={styles.body}>
            Your crystal-powered quest tracker is ready. Pick a path below to continue crafting
            knowledge spells, earn relics, and keep leveling up your hero.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <Ionicons name="ribbon" size={22} color="#f57c00" />
              <Text style={styles.statLabel}>Joined</Text>
              <Text style={styles.statValue}>{joinedAt}</Text>
            </View>
            <View style={styles.statTile}>
              <Ionicons name="time" size={22} color="#0288d1" />
              <Text style={styles.statLabel}>Last login</Text>
              <Text style={styles.statValue}>{lastLogin}</Text>
            </View>
          </View>

          <View style={styles.ctaColumn}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.cta]}
              activeOpacity={0.9}
              onPress={() => router.push('/(tabs)/explore')}>
              <Ionicons name="compass" size={22} color="#fff" style={styles.buttonIcon} />
              <View>
                <Text style={styles.buttonTitle}>Continue Quest</Text>
                <Text style={styles.buttonHelper}>Jump into today’s featured challenge</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.cta]}
              activeOpacity={0.9}
              onPress={() => router.push('/theme-select')}>
              <Ionicons name="sparkles" size={22} color="#4E342E" style={styles.buttonIcon} />
              <View>
                <Text style={styles.secondaryTitle}>Select A Hero Theme</Text>
                <Text style={styles.buttonHelperDark}>Pick a theme & gear up for tomorrow</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
  },
  card: {
    backgroundColor: 'rgba(248,235,214,0.92)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#8D6E63',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  overline: {
    textTransform: 'uppercase',
    fontWeight: '800',
    color: '#8D6E63',
    letterSpacing: 2,
    fontSize: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#4E342E',
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#4E342E',
    marginTop: 8,
  },
  body: {
    color: '#5D4037',
    marginTop: 12,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#D7CCC8',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D4C41',
    marginTop: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3E2723',
  },
  ctaColumn: {
    marginTop: 24,
    gap: 12,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  secondaryButton: {
    backgroundColor: '#ffe0b2',
    borderWidth: 3,
    borderColor: '#ffb74d',
  },
  buttonIcon: {
    marginRight: 16,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4E342E',
  },
  buttonHelper: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  buttonHelperDark: {
    fontSize: 12,
    color: '#4E342E',
  },
});
