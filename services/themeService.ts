import { doc, getDoc } from 'firebase/firestore';

import { ThemeId } from '@/constants/themeData';
import { db } from '@/config/firebase';

export const THEME_NARRATIONS_COLLECTION = 'themeNarrations';
export const THEME_PROPERTIES_COLLECTION = 'themeProperties';

type ThemeNarrationDocument = {
  text?: string;
};

type ThemePropertiesDocument = {
  elevenLabsVoiceId?: string;
  title?: string;
  accent?: string;
};

export type ThemeProperties = {
  elevenLabsVoiceId: string;
  title?: string;
  accent?: string;
};

export type ThemeContent = ThemeProperties & {
  id: ThemeId;
  narration: string;
};

const assertStringField = (value: unknown, errorMessage: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(errorMessage);
  }
  return value;
};

export const getThemeNarration = async (themeId: ThemeId): Promise<string> => {
  const ref = doc(db, THEME_NARRATIONS_COLLECTION, themeId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error(`Narration for theme "${themeId}" was not found in Firestore.`);
  }

  const data = snap.data() as ThemeNarrationDocument;
  return assertStringField(
    data?.text,
    `Narration text for theme "${themeId}" is missing or invalid.`,
  );
};

export const getThemeProperties = async (themeId: ThemeId): Promise<ThemeProperties> => {
  const ref = doc(db, THEME_PROPERTIES_COLLECTION, themeId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error(`Theme properties for "${themeId}" were not found in Firestore.`);
  }

  const data = snap.data() as ThemePropertiesDocument;
  return {
    ...data,
    elevenLabsVoiceId: assertStringField(
      data?.elevenLabsVoiceId,
      `ElevenLabs voice ID for theme "${themeId}" is missing or invalid.`,
    ),
  };
};

export const getThemeContent = async (themeId: ThemeId): Promise<ThemeContent> => {
  const [narration, properties] = await Promise.all([
    getThemeNarration(themeId),
    getThemeProperties(themeId),
  ]);

  return {
    id: themeId,
    narration,
    elevenLabsVoiceId: properties.elevenLabsVoiceId!,
    title: properties.title,
    accent: properties.accent,
  };
};

