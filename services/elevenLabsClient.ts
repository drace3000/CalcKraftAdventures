import Constants from 'expo-constants';

const ELEVEN_LABS_BASE_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_MODEL_ID = 'eleven_monolingual_v1';

type ElevenLabsConfig = {
  apiKey: string;
};

type SynthesisOptions = {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  latencyOptimization?: 0 | 1 | 2 | 3 | 4 | 5;
};

const resolveConfig = (): ElevenLabsConfig => {
  const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Record<string, string>>;
  return {
    apiKey: extra.elevenLabsApiKey ?? '',
  };
};

export const synthesizeSpeech = async (
  text: string,
  options?: SynthesisOptions,
): Promise<ArrayBuffer> => {
  const { apiKey } = resolveConfig();

  if (!apiKey) {
    throw new Error('Missing ELEVENLABS_API_KEY. Add it to your environment before starting the app.');
  }

  const voiceId = options?.voiceId;
  if (!voiceId) {
    throw new Error('Missing ElevenLabs voice ID. Provide a voiceId when calling synthesizeSpeech.');
  }

  const stability = options?.stability ?? 0.35;
  const similarityBoost = options?.similarityBoost ?? 0.75;
  const latencyOptimization = options?.latencyOptimization ?? 1;
  const modelId = options?.modelId ?? DEFAULT_MODEL_ID;

  const endpoint = `${ELEVEN_LABS_BASE_URL}/text-to-speech/${voiceId}?optimize_streaming_latency=${latencyOptimization}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs synthesis failed (${response.status}): ${errorText}`);
  }

  return response.arrayBuffer();
};

