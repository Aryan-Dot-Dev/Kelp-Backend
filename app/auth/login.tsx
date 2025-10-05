import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
    View
} from 'react-native';
import { authService } from '../../services/auth.service';

export default function Login() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!fontsLoaded) return null;

    const handleLogin = async () => {
        // Validation
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            // Call login endpoint
            const response = await fetch('https://kelp-backend-fywm.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful
                console.log('Login successful:', data);
                
                // Store token and user data
                await authService.saveAuthData(data.token, data.user);
                
                console.log('Auth data saved, navigating to dashboard...');
                
                // Navigate based on user role
                if (data.user.role === 'TEACHER') {
                    router.replace('/teacher/dashboard');
                } else {
                    router.replace('/dashboard/dashboard');
                }
            } else {
                // Handle errors from backend
                Alert.alert('Login Failed', data.error || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
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

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                        disabled={loading}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.formContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.subtitleText}>Sign in to continue your learning journey</Text>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Email Address"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
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
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                                disabled={loading}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                    size={20} 
                                    color="rgba(255,255,255,0.7)" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity 
                        style={styles.forgotPasswordContainer}
                        onPress={() => Alert.alert('Forgot Password', 'Password reset feature coming soon!')}
                        disabled={loading}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity 
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#004d40" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Sign In</Text>
                                <Ionicons name="arrow-forward" size={20} color="#004d40" style={styles.buttonIcon} />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Register Link */}
                    <View style={styles.registerLinkContainer}>
                        <Text style={styles.registerLinkText}>Don&apos;t have an account? </Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/auth/register')}
                            disabled={loading}
                        >
                            <Text style={[styles.registerLink, loading && { opacity: 0.5 }]}>Create Account</Text>
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
        marginBottom: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContent: {
        flex: 1,
        paddingTop: 20,
    },
    titleContainer: {
        marginBottom: 48,
        alignItems: 'center',
    },
    welcomeText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 32,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitleText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: '#FFFFFF',
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
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
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#004d40',
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 4,
    },
    registerLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    registerLinkText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    registerLink: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#FFFFFF',
        textDecorationLine: 'underline',
    },
});
