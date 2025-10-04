import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../../services/auth.service';

export default function OTP() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    useEffect(() => {
        // Keep the splash screen visible while we load fonts
        SplashScreen.preventAutoHideAsync();

        return () => {
            // No-op cleanup; splash will be hidden once fonts load
        };
    }, []);

    // Get registration data from route params
    const params = useLocalSearchParams();
    const { name, email, password, role } = params;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Log received data for debugging
    useEffect(() => {
        console.log('Registration data received:', { name, email, password, role });
    }, [name, email, password, role]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // When fonts aren't loaded yet keep splash visible. Once fontsLoaded becomes
    // true we'll call hideAsync below to hide the splash and render the screen.
    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync().catch(() => {
                /* ignore splash hide errors */
            });
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter all 6 digits');
            return;
        }
        
        // Prepare registration data with OTP
        const registrationData = {
            name: name as string,
            email: email as string,
            password: password as string,
            role: role as string,
            otp: otpCode
        };

        console.log('Submitting registration with OTP:', registrationData);

        try {
            // Call register endpoint to verify OTP and create user
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle error response
                Alert.alert('Error', data.error || 'Failed to verify OTP');
                return;
            }

            // Success - OTP verified and user created
            console.log('Registration successful:', data);
            
            // If backend returns token, save it and go to dashboard
            if (data.token && data.user) {
                await authService.saveAuthData(data.token, data.user);
                
                // Redirect based on role
                const dashboardPath = data.user.role === 'TEACHER' 
                    ? '/teacher/dashboard' 
                    : '/dashboard/dashboard';
                
                console.log('🚀 Redirecting to:', dashboardPath);
                
                // Platform-specific success handling
                if (typeof window !== 'undefined' && window.alert) {
                    // Web - use window.alert and immediate redirect
                    window.alert('Success! 🎉 Your account has been created successfully!');
                    router.replace(dashboardPath);
                } else {
                    // Mobile - use Alert.alert with callback
                    Alert.alert(
                        'Success! 🎉', 
                        'Your account has been created successfully!',
                        [
                            {
                                text: 'Get Started',
                                onPress: () => router.replace(dashboardPath)
                            }
                        ]
                    );
                }
            } else {
                // Otherwise go to login
                if (typeof window !== 'undefined' && window.alert) {
                    window.alert('Success! 🎉 Your account has been created successfully!');
                    router.push('/auth/login');
                } else {
                    Alert.alert(
                        'Success! 🎉', 
                        'Your account has been created successfully!',
                        [
                            {
                                text: 'Login Now',
                                onPress: () => router.push('/auth/login')
                            }
                        ]
                    );
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
        }
    };

    const handleResend = async () => {
        if (timer === 0) {
            try {
                // Call resend-otp endpoint
                const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    // Handle error response (e.g., rate limiting)
                    Alert.alert('Error', data.error || 'Failed to resend OTP');
                    return;
                }

                // Success
                setTimer(60);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                Alert.alert('Success', 'New OTP has been sent to your email');
            } catch (error) {
                console.error('Resend OTP error:', error);
                Alert.alert('Error', 'Network error. Please check your connection and try again.');
            }
        }
    };

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
            
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-outline" size={64} color="#FFFFFF" />
                    </View>

                    <Text style={styles.title}>Verify Your Email</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to{'\n'}
                        {email ? String(email) : 'your email address'}
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={[
                                    styles.otpInput,
                                    digit && styles.otpInputFilled
                                ]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={styles.verifyButton} 
                        onPress={handleVerify}
                    >
                        <Text style={styles.verifyButtonText}>Verify Code</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#004d40" style={styles.buttonIcon} />
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                            {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive the code?"}
                        </Text>
                        {timer === 0 && (
                            <TouchableOpacity onPress={handleResend}>
                                <Text style={styles.resendLink}>Resend</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
        fontFamily: "Nunito_700Bold",
        fontSize: 32,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 40,
    },
    otpInput: {
        width: 50,
        height: 60,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        fontSize: 24,
        fontFamily: "Nunito_700Bold",
        color: '#FFFFFF',
    },
    otpInputFilled: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    verifyButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
    verifyButtonText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#004d40',
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 4,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resendText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    resendLink: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#FFFFFF',
        textDecorationLine: 'underline',
    },
});
