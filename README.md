# CalcKraftAdventures

A React Native app built with Expo and Firebase integration.

## Features

- 🔥 Firebase Authentication with AsyncStorage persistence
- 📊 Firestore Database integration
- 📦 Firebase Storage support
- 📈 Firebase Analytics (web only)
- 🎨 Expo Router with file-based routing
- 📱 Cross-platform (iOS, Android, Web)

## Styling (NativeWind + Tailwind)

This project uses [NativeWind](https://www.nativewind.dev/) to bring Tailwind-style utility classes to React Native.

1. Global Tailwind layers are defined in `global.css`, which is imported in `app/_layout.tsx`.
2. Tailwind scans files under `app` and `components` as configured in `tailwind.config.js`.
3. TypeScript picks up Tailwind's type helpers via `nativewind/types` in `tsconfig.json`.
4. When creating components, use the `className` prop (provided by NativeWind) alongside standard React Native components:

```tsx
<View className="flex-1 items-center justify-center bg-slate-900">
  <Text className="text-white text-xl font-semibold">Welcome to CalcKraft</Text>
</View>
```

Run `npm install` after pulling to ensure the NativeWind/Tailwind packages are installed.

## Firebase Setup

This project uses Firebase for backend services. The Firebase configuration is set up in `config/firebase.ts`.

**Note:** For production, consider moving Firebase credentials to environment variables for better security.

## ElevenLabs Voice Setup

The theme selection screen uses ElevenLabs for narration. Supply your API key via environment variable:

```
ELEVENLABS_API_KEY=your_api_key
```

Restart Expo after updating the `.env` file so `app.config.ts` can inject the value into `expo-constants`.

## Theme Narrations & Voice IDs in Firestore

Theme narration text and ElevenLabs voice IDs now live in Firestore. Create the following collections in your Firebase project:

1. `themeNarrations` – one document per theme (document ID: `blockland`, `princess`, `unicorn`)
   ```json
   {
     "text": "Welcome to Blockland..."
   }
   ```
2. `themeProperties` – one document per theme with at least the ElevenLabs voice ID
   ```json
   {
     "elevenLabsVoiceId": "voice-id-from-elevenlabs",
     "title": "Blockland",
     "accent": "#FFB300"
   }
   ```

The app reads these documents at runtime. If a document is missing or invalid, users see an error popup and narration playback is disabled for that theme until Firestore data becomes available.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


