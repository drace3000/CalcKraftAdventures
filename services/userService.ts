import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { ThemeId } from '@/constants/themeData';
import { db } from '@/config/firebase';

export interface UserProfile {
  displayName: string;
  createdAt: Date | null;
  lastLoginAt: Date | null;
  preferredTheme: ThemeId;
}

const USERS_COLLECTION = 'users';

export async function createUserProfile(uid: string, displayName: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(userRef, {
    displayName,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    preferredTheme: 'blockland',
  });
}

export async function updateLastLogin(uid: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  });
}

export async function updatePreferredTheme(uid: string, theme: ThemeId): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    preferredTheme: theme,
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  return {
    displayName: data.displayName ?? '',
    createdAt: data.createdAt ? data.createdAt.toDate?.() ?? null : null,
    lastLoginAt: data.lastLoginAt ? data.lastLoginAt.toDate?.() ?? null : null,
    preferredTheme: data.preferredTheme ?? 'blockland',
  };
}





