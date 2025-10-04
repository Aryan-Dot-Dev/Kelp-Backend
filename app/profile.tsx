import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../services/auth.service';

interface UserData {
    email: string;
    name: string;
    role: string;
}

export default function Profile() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const data = await authService.getUserData();
        setUserData(data);
    };

    const handleLogout = async () => {
        console.log('🔵 Profile handleLogout called!');
        
        // Use browser confirm for web compatibility
        if (typeof window !== 'undefined' && window.confirm) {
            const confirmed = window.confirm('Are you sure you want to logout?');
            if (!confirmed) {
                console.log('Logout cancelled');
                return;
            }
        } else {
            // Mobile: Use Alert
            return new Promise((resolve) => {
                Alert.alert(
                    'Logout',
                    'Are you sure you want to logout?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => resolve(false)
                        },
                        {
                            text: 'Logout',
                            style: 'destructive',
                            onPress: () => resolve(true)
                        },
                    ]
                );
            }).then(async (confirmed) => {
                if (!confirmed) return;
                await performLogout();
            });
        }
        
        // Direct logout for web
        await performLogout();
    };
    
    const performLogout = async () => {
        try {
            console.log('🚪 Logging out...');
            await authService.logout();
            console.log('✅ Logout successful');
            router.replace('/');
        } catch (error) {
            console.error('❌ Logout error:', error);
            alert('Failed to logout. Please try again.');
        }
    };

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#004d40', '#00897b', '#4db6ac']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <BlurView intensity={40} style={StyleSheet.absoluteFillObject} tint="dark" pointerEvents="none" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => Alert.alert('Settings', 'Settings coming soon!')}
                >
                    <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={48} color="#00897b" />
                        </View>
                    </View>
                    
                    <Text style={styles.userName}>{userData?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{userData?.email || 'email@example.com'}</Text>
                    
                    <View style={styles.roleBadge}>
                        <Ionicons name="ribbon-outline" size={14} color="#4db6ac" />
                        <Text style={styles.roleText}>{userData?.role || 'Student'}</Text>
                    </View>
                </View>

                {/* User Details */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="mail-outline" size={20} color="#4db6ac" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{userData?.email || 'email@example.com'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="person-outline" size={20} color="#4db6ac" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Full Name</Text>
                            <Text style={styles.detailValue}>{userData?.name || 'User'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="ribbon-outline" size={20} color="#4db6ac" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Role</Text>
                            <Text style={styles.detailValue}>{userData?.role || 'Student'}</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color="#ef5350" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Kelp Education • v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        color: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(77, 182, 172, 0.5)',
    },
    userName: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 12,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(77, 182, 172, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: '#4db6ac',
    },
    roleText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: '#4db6ac',
        textTransform: 'uppercase',
    },
    detailsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    detailIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(77, 182, 172, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontFamily: "Nunito_400Regular",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 4,
    },
    detailValue: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 16,
        color: '#FFFFFF',
    },
    detailDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 83, 80, 0.15)',
        borderRadius: 16,
        padding: 18,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 83, 80, 0.3)',
        marginBottom: 24,
    },
    logoutText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#ef5350',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    footerText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
});
