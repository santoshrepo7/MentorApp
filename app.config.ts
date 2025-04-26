import { ExpoConfig } from 'expo/config';

const defineConfig = (): ExpoConfig => ({
  name: "MentorMatch",
  slug: "mentor-match",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "mentor-match",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.mentormatch.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#0c4a6e"
    },
    package: "com.mentormatch.app"
  },
  web: {
    bundler: "metro",
    output: "server",
    favicon: "./assets/images/favicon.png"
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
    }
  }
});

export default defineConfig;