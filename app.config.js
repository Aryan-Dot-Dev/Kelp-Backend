export default {
  expo: {
    name: "Kelp",
    slug: "kelp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/kelp-splash-icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/kelp-splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.suspicious.kelp"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/kelp-splash-icon.png",
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
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://kelp-backend-fywm.onrender.com"
    }
  }
};