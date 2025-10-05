import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
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
import { authService } from '../../services/auth.service';

export default function TeacherDashboard() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        lowAttendanceCount: 0,
        totalAssignments: 0,
        pendingSubmissions: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await loadUserData();
        await loadStats();
    };

    const loadUserData = async () => {
        try {
            const data = await authService.getUserData();
            setUserData(data);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadStats = async () => {
        try {
            const token = await authService.getToken();
            
            // Fetch students attendance for stats
            const attendanceResponse = await fetch('https://kelp-backend-fywm.onrender.com/api/assignments/attendance/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                const students = attendanceData.students || [];
                const lowAttendance = students.filter((s: any) => Number(s.totalPercentage) < 75).length;
                
                setStats(prev => ({
                    ...prev,
                    totalStudents: students.length,
                    lowAttendanceCount: lowAttendance
                }));
            }

            // Fetch assignments for stats
            const assignmentsResponse = await fetch('https://kelp-backend-fywm.onrender.comywm.onrender.com/api/assignments/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (assignmentsResponse.ok) {
                const assignmentsData = await assignmentsResponse.json();
                const assignments = assignmentsData.assignments || [];
                
                setStats(prev => ({
                    ...prev,
                    totalAssignments: assignments.length
                }));
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleLogout = async () => {
        console.log('🔵 Teacher handleLogout called!');
        
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
            console.log('🚪 Teacher logging out...');
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
            />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>{userData?.name || 'Teacher'}</Text>
                        <View style={styles.roleBadge}>
                            <Ionicons name="school" size={14} color="#4db6ac" />
                            <Text style={styles.roleText}>{userData?.role || 'TEACHER'}</Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            style={styles.profileButton}
                            onPress={() => router.push('/profile')}
                        >
                            <Ionicons name="person-outline" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#ef5350" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="people" size={32} color="#4CAF50" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalStudents}</Text>
                        <Text style={styles.statLabel}>Total Students</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="warning" size={32} color="#FF9800" />
                        </View>
                        <Text style={styles.statValue}>{stats.lowAttendanceCount}</Text>
                        <Text style={styles.statLabel}>Low Attendance</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="document-text" size={32} color="#2196F3" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalAssignments}</Text>
                        <Text style={styles.statLabel}>Assignments</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="time" size={32} color="#9C27B0" />
                        </View>
                        <Text style={styles.statValue}>{stats.pendingSubmissions}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>

                {/* Main Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                        style={styles.actionCard}
                        onPress={() => router.push('/teacher/students-attendance')}
                    >
                        <View style={styles.actionIconContainer}>
                            <Ionicons name="checkmark-done" size={40} color="#FFFFFF" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Students Attendance</Text>
                            <Text style={styles.actionDescription}>
                                View and monitor all students&apos; attendance records
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionCard}
                        onPress={() => router.push('/teacher/assignments')}
                    >
                        <View style={styles.actionIconContainer}>
                            <Ionicons name="document-text" size={40} color="#FFFFFF" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Assignments</Text>
                            <Text style={styles.actionDescription}>
                                Create, edit, and manage class assignments
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionCard}
                        onPress={() => router.push('/dashboard/exams')}
                    >
                        <View style={styles.actionIconContainer}>
                            <Ionicons name="school" size={40} color="#FFFFFF" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Exam Schedule</Text>
                            <Text style={styles.actionDescription}>
                                View and manage examination schedules
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionCard}
                        onPress={() => router.push('/dashboard/timetable')}
                    >
                        <View style={styles.actionIconContainer}>
                            <Ionicons name="calendar" size={40} color="#FFFFFF" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Class Timetable</Text>
                            <Text style={styles.actionDescription}>
                                View weekly class schedule and timings
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    greeting: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    userName: {
        fontFamily: "Nunito_700Bold",
        fontSize: 28,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: '#FFFFFF',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    statIconContainer: {
        marginBottom: 8,
    },
    statValue: {
        fontFamily: "Nunito_700Bold",
        fontSize: 32,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        gap: 16,
    },
    actionIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    actionDescription: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});
