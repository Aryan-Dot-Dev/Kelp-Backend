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
import { authService } from '../../services/auth.service';
import timetableUtil from '../../utils/timetable.util';

export default function Dashboard() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [userData, setUserData] = useState<any>(null);
    const [attendanceData, setAttendanceData] = useState<any>(null);
    const [nextLecture, setNextLecture] = useState<any>(null);
    const [upcomingExam, setUpcomingExam] = useState<any>(null);

    useEffect(() => {
        loadUserData();
        loadAttendanceData();
        findNextLecture();
        loadUpcomingExam();
    }, []);

    const loadUserData = async () => {
        try {
            const data = await authService.getUserData();
            setUserData(data);
            console.log('User data loaded:', data);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadAttendanceData = async () => {
        try {
            const user = await authService.getUserData();
            if (!user || !user.id) return;

            const response = await fetch(`http://localhost:5000/api/attendance/latest/${user.id}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setAttendanceData(data.data);
            }
        } catch (error) {
            console.log('Could not load attendance:', error);
        }
    };

    const findNextLecture = () => {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Find today's schedule
        const todaySchedule = timetableUtil.find(day => day.day === currentDay);
        if (!todaySchedule) return;

        // Parse time string to minutes
        const parseTime = (timeStr: string) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        // Find next lecture
        for (const subject of todaySchedule.subjects) {
            const [startTime] = subject.time.split(' - ');
            const lectureStartMinutes = parseTime(startTime);

            if (lectureStartMinutes > currentTime && subject.name !== 'Lunch Break' && subject.name !== '-') {
                setNextLecture(subject);
                return;
            }
        }
    };

    const loadUpcomingExam = async () => {
        try {
            const token = await authService.getToken();
            const response = await fetch('http://localhost:5000/api/exams/upcoming', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success && data.exams && data.exams.length > 0) {
                setUpcomingExam(data.exams[0]);
            }
        } catch (error) {
            console.log('Could not load upcoming exam:', error);
        }
    };

    const getDaysUntilExam = (dateString: string) => {
        const examDate = new Date(dateString);
        const now = new Date();
        const diffTime = examDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatExamDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!fontsLoaded) return null;

    const handleLogout = async () => {
        console.log('🔵 handleLogout called!');
        
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

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#004d40', '#00897b', '#4db6ac']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <BlurView intensity={40} style={StyleSheet.absoluteFillObject} tint="dark" pointerEvents="none" />

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        {userData && (
                            <Text style={styles.appName}>{userData.name}</Text>
                        )}
                    </View>
                    <View style={styles.headerButtons}>
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

                {/* 2x2 Grid of Main Actions */}
                <View style={styles.gridContainer}>
                    <View style={styles.gridRow}>
                        <TouchableOpacity 
                            style={styles.gridCard}
                            onPress={() => router.push('/dashboard/timetable')}
                        >
                            <View style={styles.gridIconContainer}>
                                <Ionicons name="calendar-outline" size={44} color="#FFFFFF" />
                            </View>
                            <Text style={styles.gridCardTitle}>TimeTable</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.gridCard}
                            onPress={() => router.push('/dashboard/attendance')}
                        >
                            <View style={styles.gridIconContainer}>
                                <Ionicons name="checkmark-done-outline" size={44} color="#FFFFFF" />
                            </View>
                            <Text style={styles.gridCardTitle}>Attendance</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.gridRow}>
                        <TouchableOpacity 
                            style={styles.gridCard}
                            onPress={() => router.push('/dashboard/assignments')}
                        >
                            <View style={styles.gridIconContainer}>
                                <Ionicons name="document-text-outline" size={44} color="#FFFFFF" />
                            </View>
                            <Text style={styles.gridCardTitle}>Assignments</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.gridCard}
                            onPress={() => router.push('/dashboard/exams')}
                        >
                            <View style={styles.gridIconContainer}>
                                <Ionicons name="school-outline" size={44} color="#FFFFFF" />
                            </View>
                            <Text style={styles.gridCardTitle}>Exams</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Info Cards */}
                <View style={styles.quickInfoContainer}>
                    {/* Attendance Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                            <Text style={styles.infoCardLabel}>Overall Attendance</Text>
                        </View>
                        {attendanceData ? (
                            <>
                                <Text style={styles.infoCardValue}>
                                    {Number(attendanceData.totalPercentage || 0).toFixed(1)}%
                                </Text>
                                <Text style={styles.infoCardSubtext}>
                                    {attendanceData.totalAttended || 0}/{attendanceData.totalDelivered || 0} classes attended
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.infoCardValue}>--.--%</Text>
                                <Text style={styles.infoCardSubtext}>No data synced yet</Text>
                            </>
                        )}
                    </View>

                    {/* Next Lecture Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <Ionicons name="time" size={24} color="#2196F3" />
                            <Text style={styles.infoCardLabel}>Next Lecture</Text>
                        </View>
                        {nextLecture ? (
                            <>
                                <Text style={styles.infoCardTitle} numberOfLines={2}>
                                    {nextLecture.name}
                                </Text>
                                <View style={styles.infoCardDetails}>
                                    <View style={styles.infoCardDetail}>
                                        <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.infoCardDetailText}>{nextLecture.time}</Text>
                                    </View>
                                    <View style={styles.infoCardDetail}>
                                        <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.infoCardDetailText}>{nextLecture.location}</Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.infoCardTitle}>No more lectures</Text>
                                <Text style={styles.infoCardSubtext}>Enjoy your free time! 🎉</Text>
                            </>
                        )}
                    </View>

                    {/* Upcoming Exam Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <Ionicons name="alert-circle" size={24} color="#FFA726" />
                            <Text style={styles.infoCardLabel}>Next Exam</Text>
                        </View>
                        {upcomingExam ? (
                            <>
                                <Text style={styles.infoCardTitle} numberOfLines={2}>
                                    {upcomingExam.title}
                                </Text>
                                <View style={styles.examCountdownContainer}>
                                    <View style={styles.examCountdownBox}>
                                        <Text style={styles.examCountdownNumber}>
                                            {getDaysUntilExam(upcomingExam.date)}
                                        </Text>
                                        <Text style={styles.examCountdownLabel}>days left</Text>
                                    </View>
                                    <View style={styles.examDateInfo}>
                                        <View style={styles.infoCardDetail}>
                                            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
                                            <Text style={styles.infoCardDetailText}>{formatExamDate(upcomingExam.date)}</Text>
                                        </View>
                                        <View style={styles.infoCardDetail}>
                                            <Ionicons name={upcomingExam.type === 'MIDSEM' ? 'book-outline' : 'school-outline'} size={14} color="rgba(255,255,255,0.7)" />
                                            <Text style={styles.infoCardDetailText}>{upcomingExam.type}</Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.infoCardTitle}>No exams scheduled</Text>
                                <Text style={styles.infoCardSubtext}>Relax and study! 📚</Text>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    welcomeText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    appName: {
        fontFamily: "Nunito_700Bold",
        fontSize: 28,
        color: '#FFFFFF',
    },
    headerButtons: {
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
    gridContainer: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    gridCard: {
        flex: 1,
        aspectRatio: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gridIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    gridCardTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    quickInfoContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    infoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoCardLabel: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    infoCardValue: {
        fontFamily: "Nunito_700Bold",
        fontSize: 36,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    infoCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoCardSubtext: {
        fontFamily: "Nunito_400Regular",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    infoCardTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    infoCardDetails: {
        gap: 6,
    },
    infoCardDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoCardDetailText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    examCountdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    examCountdownBox: {
        backgroundColor: 'rgba(255, 167, 38, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 167, 38, 0.3)',
    },
    examCountdownNumber: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        color: '#FFA726',
    },
    examCountdownLabel: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    examDateInfo: {
        flex: 1,
        gap: 4,
    },
});