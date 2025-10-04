import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export default function Index() {
  const hourHand = useRef(new Animated.Value(0)).current;
  const minuteHand = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAuthAndRedirect();
    startClockAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndRedirect = async () => {
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Always redirect to splash
    console.log('Index: Redirecting to splash...');
    router.push('/splash');
  };

  const startClockAnimation = () => {
    // Hour hand - slower, smoother rotation (12 seconds)
    Animated.loop(
      Animated.timing(hourHand, {
        toValue: 1,
        duration: 12000,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth ease-in-out
        useNativeDriver: true,
      })
    ).start();

    // Minute hand - softer, gentler rotation (2 seconds)
    Animated.loop(
      Animated.timing(minuteHand, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth ease-in-out
        useNativeDriver: true,
      })
    ).start();
  };

  const hourHandRotation = hourHand.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const minuteHandRotation = minuteHand.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Clock Loader */}
      <View style={styles.clockContainer}>
        {/* Clock Circle */}
        <View style={styles.clockCircle} />
        
        {/* Hour Hand (slow rotation - 9s) */}
        <Animated.View
          style={[
            styles.hourHand,
            {
              transform: [{ rotate: hourHandRotation }],
            },
          ]}
        />
        
        {/* Minute Hand (fast rotation - 0.75s) */}
        <Animated.View
          style={[
            styles.minuteHand,
            {
              transform: [{ rotate: minuteHandRotation }],
            },
          ]}
        />
        
        {/* Center Dot */}
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#26a69a",
            position: "absolute",
            shadowColor: "#26a69a",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#004d40",
  },
  clockContainer: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  clockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: "#26a69a",
    position: "absolute",
    shadowColor: "#26a69a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  hourHand: {
    position: "absolute",
    width: 10,
    height: 30,
    backgroundColor: "#26a69a",
    borderRadius: 20,
    top: 30,
    left: "50%",
    marginLeft: -1.5,
    transformOrigin: "center 30px",
    shadowColor: "#26a69a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  minuteHand: {
    position: "absolute",
    width: 15,
    height: 45,
    backgroundColor: "#4db6ac",
    borderRadius: 20,
    top: 15,
    left: "50%",
    marginLeft: -1,
    transformOrigin: "center 45px",
    shadowColor: "#4db6ac",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
});