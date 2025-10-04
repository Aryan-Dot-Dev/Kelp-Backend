export default {
  expo: {
    name: "Kelp",
    slug: "kelp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.suspicious.kelp"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.suspicious.kelp"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "5af890a2-1a28-40f9-a25e-bb6232db8a09"
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"
    }
  }
};