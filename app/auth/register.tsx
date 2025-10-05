import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

export default function Register() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    useEffect(() => {
        // Keep native splash visible while loading fonts
        SplashScreen.preventAutoHideAsync();

        return () => {
            // cleanup no-op; splash will be hidden once fonts load
        };
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
        otp: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showCRRole, setShowCRRole] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shakeCount, setShakeCount] = useState(0);
    const lastShake = useRef<number>(0);
    const shakeUnlocked = useRef(false);
    const [devShakeCount, setDevShakeCount] = useState(0); // For testing on web

    // Easter egg: Shake device to unlock CR role
    useEffect(() => {
        let subscription: any;

        const setupAccelerometer = async () => {
            try {
                // Check if accelerometer is available
                const isAvailable = await Accelerometer.isAvailableAsync();
                
                if (!isAvailable) {
                    console.log('Accelerometer not available - use secret button for testing');
                    return;
                }

                // Set update interval to 100ms
                Accelerometer.setUpdateInterval(100);

                subscription = Accelerometer.addListener(({ x, y, z }) => {
                    // Calculate total acceleration
                    const acceleration = Math.sqrt(x * x + y * y + z * z);
                    const now = Date.now();

                    // Detect shake (acceleration > 2.5) with debounce (500ms between shakes)
                    if (acceleration > 2.5 && now - lastShake.current > 500 && !shakeUnlocked.current) {
                        lastShake.current = now;
                        const newCount = shakeCount + 1;
                        setShakeCount(newCount);

                        // Vibrate for feedback
                        Vibration.vibrate(50);

                        // Unlock after 3 shakes
                        if (newCount >= 3) {
                            unlockCRRole();
                        }
                    }
                });
            } catch (error) {
                console.log('Accelerometer not available:', error);
            }
        };

        setupAccelerometer();

        return () => {
            subscription && subscription.remove();
        };
    }, [shakeCount]);

    const unlockCRRole = () => {
        shakeUnlocked.current = true;
        setShowCRRole(true);
        Vibration.vibrate([0, 100, 100, 100]); // Victory vibration pattern
        Alert.alert(
            '🎉 Easter Egg Unlocked!',
            'You shook your way to CR role!',
            [{ text: 'Awesome!', style: 'default' }]
        );
        setShakeCount(0);
    };

    // Secret button for testing on web/laptop (triple-click the title)
    const handleSecretTap = () => {
        if (shakeUnlocked.current) return;

        const newCount = devShakeCount + 1;
        setDevShakeCount(newCount);

        console.log(`Secret tap ${newCount}/3`);

        if (newCount >= 3) {
            unlockCRRole();
            setDevShakeCount(0);
        }

        // Reset counter after 2 seconds
        setTimeout(() => {
            setDevShakeCount(0);
        }, 2000);
    };

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync().catch(() => {
                /* ignore */
            });
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    const handleRegister = async () => {
        // Validation
        if (!formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Name validation for teachers
        if (formData.role === 'TEACHER' && !formData.name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        // Password length validation
        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            // Call send-otp endpoint
            const response = await fetch('https://kelp-backend-fywm.onrender.com/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (response.ok) {
                // OTP sent successfully, navigate to OTP page with form data
                console.log('OTP sent successfully');
                router.push({
                    pathname: '/auth/otp',
                    params: {
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        role: formData.role
                    }
                });
            } else {
                // Handle errors from backend
                Alert.alert('Error', data.error || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'STUDENT', label: 'Student' },
        { value: 'TEACHER', label: 'Teacher' }
    ];

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#004d40', '#00897b', '#4db6ac']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <BlurView intensity={40} style={StyleSheet.absoluteFillObject} tint="dark" />
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSecretTap} activeOpacity={0.9}>
                        <Text style={styles.headerTitle}>Join Kelp</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContent}>
                    <Text style={styles.welcomeText}>Create Your Account</Text>
                    <Text style={styles.subtitleText}>Enter your details to get started</Text>

                        {/* Name Input - Only for Teachers */}
                        {formData.role === 'TEACHER' && (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Full Name"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({...formData, name: text})}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>
                        )}

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Email Address"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({...formData, email: text})}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Password"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({...formData, password: text})}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons 
                                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                        size={20} 
                                        color="rgba(255,255,255,0.7)" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Role Selection */}
                        <View style={styles.inputGroup}>
                            <View style={styles.roleContainer}>
                                {roles.map((role) => (
                                    <TouchableOpacity
                                        key={role.value}
                                        style={[
                                            styles.roleButton,
                                            formData.role === role.value && styles.roleButtonActive
                                        ]}
                                        onPress={() => setFormData({...formData, role: role.value})}
                                    >
                                        <Ionicons 
                                            name={role.value === 'STUDENT' ? 'school-outline' : 'person-outline'} 
                                            size={20} 
                                            color={formData.role === role.value ? '#004d40' : 'rgba(255,255,255,0.8)'} 
                                            style={styles.roleIcon}
                                        />
                                        <Text style={[
                                            styles.roleButtonText,
                                            formData.role === role.value && styles.roleButtonTextActive
                                        ]}>
                                            {role.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                
                                {/* CR Role - Easter Egg */}
                                {showCRRole && (
                                    <TouchableOpacity
                                        style={[
                                            styles.roleButton,
                                            formData.role === 'CR' && styles.roleButtonActive
                                        ]}
                                        onPress={() => setFormData({...formData, role: 'CR'})}
                                    >
                                        <Ionicons 
                                            name="star" 
                                            size={20} 
                                            color={formData.role === 'CR' ? '#004d40' : 'rgba(255,255,255,0.8)'} 
                                            style={styles.roleIcon}
                                        />
                                        <Text style={[
                                            styles.roleButtonText,
                                            formData.role === 'CR' && styles.roleButtonTextActive
                                        ]}>
                                            CR
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity 
                            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#004d40" />
                            ) : (
                                <>
                                    <Text style={styles.registerButtonText}>Create Account</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#004d40" style={styles.buttonIcon} />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginLinkContainer}>
                            <Text style={styles.loginLinkText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 28,
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    formContent: {
        paddingTop: 20,
    },
    welcomeText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 28,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitleText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 48,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: '#FFFFFF',
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
        marginLeft: 8,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    roleButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    roleButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.9)',
    },
    roleIcon: {
        marginRight: 8,
    },
    roleButtonText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    roleButtonTextActive: {
        color: '#004d40',
    },
    registerButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#004d40',
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 4,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginLinkText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    loginLink: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#FFFFFF',
        textDecorationLine: 'underline',
    },
});
