import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import { authService } from '../services/auth.service';

const SlideButton = () => {
    const [isCompleted, setIsCompleted] = useState(false);
    const slideAnimation = useRef(new Animated.Value(0)).current;
    const { width: screenWidth } = Dimensions.get('window');
    const buttonWidth = Math.min(screenWidth - 80, 320); // Max width of 320px
    const thumbSize = 60;
    const maxSlide = buttonWidth - thumbSize - 8; // 4px padding on each side

    // Reset the slider when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // Reset animation and completion state when screen is focused
            slideAnimation.setValue(0);
            setIsCompleted(false);
        }, [slideAnimation])
    );

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => !isCompleted,
        onMoveShouldSetPanResponder: () => !isCompleted,
        onPanResponderMove: (_, gestureState) => {
            if (!isCompleted) {
                const newValue = Math.max(0, Math.min(maxSlide, gestureState.dx));
                slideAnimation.setValue(newValue);
            }
        },
        onPanResponderRelease: async (_, gestureState) => {
            if (!isCompleted) {
                if (gestureState.dx > maxSlide * 0.7) {
                    // Complete the slide
                    Animated.spring(slideAnimation, {
                        toValue: maxSlide,
                        useNativeDriver: false,
                    }).start(async () => {
                        setIsCompleted(true);
                        
                        // Check if user is logged in
                        const isLoggedIn = await authService.isLoggedIn();
                        console.log('Slide completed - User logged in?', isLoggedIn);
                        
                        setTimeout(() => {
                            if (isLoggedIn) {
                                // User is logged in, go to dashboard
                                router.push('/dashboard/dashboard');
                            } else {
                                // User not logged in, go to register
                                router.push('/auth/register');
                            }
                        }, 500);
                    });
                } else {
                    // Snap back
                    Animated.spring(slideAnimation, {
                        toValue: 0,
                        useNativeDriver: false,
                    }).start();
                }
            }
        },
    });

    const thumbStyle = {
        transform: [{ translateX: slideAnimation }],
    };

    // Green fill that follows the thumb
    const progressWidth = slideAnimation.interpolate({
        inputRange: [0, maxSlide],
        outputRange: [0, maxSlide + thumbSize],
    });

    return (
        <View style={styles.container}>
            <View style={[styles.track, { width: buttonWidth }]}>
                <Animated.View 
                    style={[styles.progressTrack, { width: progressWidth }]}
                />
                
                <View style={styles.textContainer}>
                    <Text style={styles.text}>
                        {isCompleted ? 'Welcome!' : 'Slide to Proceed'}
                    </Text>
                </View>

                <Animated.View
                    style={[styles.thumb, thumbStyle]}
                    {...panResponder.panHandlers}
                >
                    <Ionicons 
                        name={isCompleted ? "checkmark" : "chevron-forward"} 
                        size={24} 
                        color={isCompleted ? "#00695c" : "#004d40"} 
                    />
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 40,
    },
    track: {
        height: 70,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark semi-transparent background
        borderRadius: 35,
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)', // White border for contrast
    },
    progressTrack: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        backgroundColor: '#26a69a', // Vibrant, noticeable teal/green
        borderRadius: 35,
    },
    textContainer: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: "Cairo_400Regular",
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    thumb: {
        position: 'absolute',
        left: 4,
        width: 60,
        height: 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 77, 64, 0.1)',
    },
});

export default SlideButton;