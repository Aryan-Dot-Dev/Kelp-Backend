import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../../services/auth.service';

interface CourseAttendance {
    id: string;
    srNo: number;
    courseName: string;
    courseShortName: string;
    courseCode: string;
    attended: number;
    delivered: number;
    percentage: number;
    scrapedAt: string;
}

interface StudentAttendance {
    id: string;
    userId: string;
    totalAttended: number;
    totalDelivered: number;
    totalPercentage: number;
    lastScraped: string;
    CourseAttendance: CourseAttendance[];
}

export default function Attendance() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [attendance, setAttendance] = useState<StudentAttendance | null>(null);

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        try {
            const userData = await authService.getUserData();
            
            if (!userData || !userData.id) {
                Alert.alert('Error', 'User not found. Please login again.');
                return;
            }

            const response = await fetch(`https://kelp-backend-fywm.onrender.com/api/attendance/student/${userData.id}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setAttendance(data.data);
            } else {
                Alert.alert('Error', data.error || 'Failed to load attendance');
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
            Alert.alert('Error', 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAttendance();
        setRefreshing(false);
    };

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 75) return '#4caf50'; // Green
        if (percentage >= 65) return '#ff9800'; // Orange
        return '#f44336'; // Red
    };

    const getAttendanceStatus = (percentage: number) => {
        if (percentage >= 75) return 'Good';
        if (percentage >= 65) return 'Warning';
        return 'Critical';
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
            <BlurView intensity={40} style={StyleSheet.absoluteFillObject} tint="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Attendance</Text>
                <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    <Ionicons 
                        name="refresh" 
                        size={24} 
                        color="white" 
                        style={refreshing ? styles.spinning : undefined}
                    />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading attendance...</Text>
                </View>
            ) : !attendance ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={64} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.emptyText}>No attendance data found</Text>
                    <Text style={styles.emptySubtext}>Sync your attendance from the browser extension</Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#FFFFFF"
                        />
                    }
                >
                    {/* Overall Attendance Card */}
                    <View style={styles.overallCard}>
                        <View style={styles.overallHeader}>
                            <Text style={styles.overallLabel}>Overall Attendance</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: getAttendanceColor(Number(attendance.totalPercentage)) }
                            ]}>
                                <Text style={styles.statusText}>
                                    {getAttendanceStatus(Number(attendance.totalPercentage))}
                                </Text>
                            </View>
                        </View>
                        
                        <Text style={[
                            styles.overallPercentage,
                            { color: getAttendanceColor(Number(attendance.totalPercentage)) }
                        ]}>
                            {Number(attendance.totalPercentage).toFixed(2)}%
                        </Text>
                        
                        <View style={styles.overallStats}>
                            <View style={styles.statItem}>
                                <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                                <Text style={styles.statValue}>{attendance.totalAttended}</Text>
                                <Text style={styles.statLabel}>Present</Text>
                            </View>
                            
                            <View style={styles.statDivider} />
                            
                            <View style={styles.statItem}>
                                <Ionicons name="calendar" size={24} color="#FFFFFF" />
                                <Text style={styles.statValue}>{attendance.totalDelivered}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                            
                            <View style={styles.statDivider} />
                            
                            <View style={styles.statItem}>
                                <Ionicons name="close-circle" size={24} color="#f44336" />
                                <Text style={styles.statValue}>
                                    {attendance.totalDelivered - attendance.totalAttended}
                                </Text>
                                <Text style={styles.statLabel}>Absent</Text>
                            </View>
                        </View>

                        {attendance.lastScraped && (
                            <Text style={styles.lastSynced}>
                                Last synced: {new Date(attendance.lastScraped).toLocaleString()}
                            </Text>
                        )}
                    </View>

                    {/* Course-wise Attendance */}
                    <View style={styles.sectionHeader}>
                        <Ionicons name="book-outline" size={20} color="white" />
                        <Text style={styles.sectionTitle}>Course-wise Attendance</Text>
                    </View>

                    {attendance.CourseAttendance.map((course) => (
                        <View key={course.id} style={styles.courseCard}>
                            <View style={styles.courseHeader}>
                                <View style={styles.courseInfo}>
                                    <Text style={styles.courseName} numberOfLines={2}>
                                        {course.courseName}
                                    </Text>
                                    <Text style={styles.courseCode}>{course.courseCode}</Text>
                                </View>
                                <View style={[
                                    styles.coursePercentageBadge,
                                    { borderColor: getAttendanceColor(Number(course.percentage)) }
                                ]}>
                                    <Text style={[
                                        styles.coursePercentage,
                                        { color: getAttendanceColor(Number(course.percentage)) }
                                    ]}>
                                        {Number(course.percentage).toFixed(1)}%
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <View 
                                    style={[
                                        styles.progressBar,
                                        { 
                                            width: `${Number(course.percentage)}%`,
                                            backgroundColor: getAttendanceColor(Number(course.percentage))
                                        }
                                    ]}
                                />
                            </View>

                            {/* Stats Row */}
                            <View style={styles.courseStats}>
                                <View style={styles.courseStatItem}>
                                    <Ionicons name="checkmark" size={16} color="#4caf50" />
                                    <Text style={styles.courseStatText}>
                                        {course.attended} Present
                                    </Text>
                                </View>
                                <View style={styles.courseStatItem}>
                                    <Ionicons name="close" size={16} color="#f44336" />
                                    <Text style={styles.courseStatText}>
                                        {course.delivered - course.attended} Absent
                                    </Text>
                                </View>
                                <View style={styles.courseStatItem}>
                                    <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.courseStatText}>
                                        {course.delivered} Total
                                    </Text>
                                </View>
                            </View>

                            {/* Required Classes to Reach 75% */}
                            {Number(course.percentage) < 75 && (
                                <View style={styles.warningBox}>
                                    <Ionicons name="alert-circle" size={16} color="#ff9800" />
                                    <Text style={styles.warningText}>
                                        Need {Math.ceil((0.75 * Number(course.delivered) - Number(course.attended)) / 0.25)} more classes to reach 75%
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            💡 Tip: Maintain 75% attendance for eligibility
                        </Text>
                    </View>
                </ScrollView>
            )}
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
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinning: {
        // Add animation here if needed
    },
    headerTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 20,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    emptySubtext: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    overallCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    overallHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    overallLabel: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 12,
        color: '#FFFFFF',
    },
    overallPercentage: {
        fontFamily: "Nunito_700Bold",
        fontSize: 64,
        textAlign: 'center',
        marginBottom: 24,
    },
    overallStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        color: '#FFFFFF',
    },
    statLabel: {
        fontFamily: "Nunito_400Regular",
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    lastSynced: {
        fontFamily: "Nunito_400Regular",
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#FFFFFF',
    },
    courseCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    courseInfo: {
        flex: 1,
        marginRight: 12,
    },
    courseName: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    courseCode: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    coursePercentageBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    coursePercentage: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    courseStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    courseStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    courseStatText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.3)',
    },
    warningText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: '#ff9800',
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    footerText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
});
