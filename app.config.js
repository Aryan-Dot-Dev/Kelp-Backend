export default {
  name: "Kelp",
  slug: "kelp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/kelp-splash-icon.png",
  scheme: "kelp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/kelp-splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.kelp"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/kelp-splash-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.yourcompany.kelp"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/kelp-splash-icon.png"
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-document-picker",
      {
        "iCloudContainerEnvironment": "Production"
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    // Add your backend URL as environment variable
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"
  }
}
