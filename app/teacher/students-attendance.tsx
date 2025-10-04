import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../../services/auth.service';

interface Student {
    id: string;
    userId: string;
    totalAttended: number;
    totalDelivered: number;
    totalPercentage: string;
    User: {
        name: string;
        email: string;
        role: string;
    };
    CourseAttendance: {
        courseName: string;
        percentage: string;
        attended: number;
        delivered: number;
    }[];
}

export default function StudentsAttendance() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'percentage'>('percentage');

    useEffect(() => {
        loadStudentsAttendance();
    }, []);

    useEffect(() => {
        filterAndSortStudents();
    }, [searchQuery, sortBy, students]);

    const loadStudentsAttendance = async () => {
        try {
            const token = await authService.getToken();
            const response = await fetch('http://localhost:5000/api/assignments/attendance/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setStudents(data.students || []);
            }
        } catch (error) {
            console.error('Error loading students attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortStudents = () => {
        let filtered = [...students];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(student =>
                student.User.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.User.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        if (sortBy === 'percentage') {
            filtered.sort((a, b) => Number(a.totalPercentage) - Number(b.totalPercentage));
        } else {
            filtered.sort((a, b) => a.User.name.localeCompare(b.User.name));
        }

        setFilteredStudents(filtered);
    };

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 75) return '#4caf50';
        if (percentage >= 65) return '#ff9800';
        return '#ef5350';
    };

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#004d40', '#00897b', '#4db6ac']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Students Attendance</Text>
                    <Text style={styles.headerSubtitle}>{filteredStudents.length} students</Text>
                </View>
                <View style={styles.backButton} />
            </View>

            {/* Search and Sort */}
            <View style={styles.controlsContainer}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.sortContainer}>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'percentage' && styles.sortButtonActive]}
                        onPress={() => setSortBy('percentage')}
                    >
                        <Ionicons 
                            name="trending-down" 
                            size={16} 
                            color={sortBy === 'percentage' ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} 
                        />
                        <Text style={[
                            styles.sortButtonText,
                            sortBy === 'percentage' && styles.sortButtonTextActive
                        ]}>
                            By %
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
                        onPress={() => setSortBy('name')}
                    >
                        <Ionicons 
                            name="text" 
                            size={16} 
                            color={sortBy === 'name' ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} 
                        />
                        <Text style={[
                            styles.sortButtonText,
                            sortBy === 'name' && styles.sortButtonTextActive
                        ]}>
                            By Name
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading students data...</Text>
                </View>
            ) : filteredStudents.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.emptyText}>No students found</Text>
                    <Text style={styles.emptySubtext}>
                        {searchQuery ? 'Try a different search term' : 'No attendance data available'}
                    </Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Summary Stats */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>
                                {filteredStudents.filter(s => Number(s.totalPercentage) >= 75).length}
                            </Text>
                            <Text style={styles.summaryLabel}>Good (&gt;75%)</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, {color: '#ff9800'}]}>
                                {filteredStudents.filter(s => Number(s.totalPercentage) >= 65 && Number(s.totalPercentage) < 75).length}
                            </Text>
                            <Text style={styles.summaryLabel}>Warning (65-75%)</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, {color: '#ef5350'}]}>
                                {filteredStudents.filter(s => Number(s.totalPercentage) < 65).length}
                            </Text>
                            <Text style={styles.summaryLabel}>Critical (&lt;65%)</Text>
                        </View>
                    </View>

                    {/* Student Cards */}
                    {filteredStudents.map((student) => (
                        <View key={student.id} style={styles.studentCard}>
                            <View style={styles.studentHeader}>
                                <View style={styles.studentInfo}>
                                    <View style={styles.avatarContainer}>
                                        <Ionicons name="person" size={24} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.studentDetails}>
                                        <Text style={styles.studentName}>{student.User.name}</Text>
                                        <Text style={styles.studentEmail}>{student.User.email}</Text>
                                    </View>
                                </View>
                                <View style={styles.percentageContainer}>
                                    <Text style={[
                                        styles.percentageValue,
                                        { color: getPercentageColor(Number(student.totalPercentage)) }
                                    ]}>
                                        {Number(student.totalPercentage).toFixed(1)}%
                                    </Text>
                                    <Text style={styles.attendanceCount}>
                                        {student.totalAttended}/{student.totalDelivered}
                                    </Text>
                                </View>
                            </View>

                            {Number(student.totalPercentage) < 75 && (
                                <View style={styles.warningBanner}>
                                    <Ionicons 
                                        name={Number(student.totalPercentage) < 65 ? "alert-circle" : "warning"} 
                                        size={16} 
                                        color={Number(student.totalPercentage) < 65 ? "#ef5350" : "#ff9800"} 
                                    />
                                    <Text style={styles.warningText}>
                                        {Number(student.totalPercentage) < 65 
                                            ? 'Critical: Below 65% - Action required!' 
                                            : 'Warning: Below 75% - Monitor attendance'}
                                    </Text>
                                </View>
                            )}

                            {/* Course-wise breakdown */}
                            <View style={styles.coursesContainer}>
                                <Text style={styles.coursesTitle}>Course-wise Attendance:</Text>
                                {student.CourseAttendance.slice(0, 3).map((course, index) => (
                                    <View key={index} style={styles.courseRow}>
                                        <Text style={styles.courseName} numberOfLines={1}>
                                            {course.courseName}
                                        </Text>
                                        <View style={styles.courseStats}>
                                            <Text style={styles.courseCount}>
                                                {course.attended}/{course.delivered}
                                            </Text>
                                            <Text style={[
                                                styles.coursePercentage,
                                                { color: getPercentageColor(Number(course.percentage)) }
                                            ]}>
                                                {Number(course.percentage).toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                {student.CourseAttendance.length > 3 && (
                                    <Text style={styles.moreCoursesText}>
                                        +{student.CourseAttendance.length - 3} more courses
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
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
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 20,
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    controlsContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: '#FFFFFF',
    },
    sortContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    sortButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    sortButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    sortButtonText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    sortButtonTextActive: {
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
        color: '#FFFFFF',
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
    },
    emptySubtext: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontFamily: "Nunito_700Bold",
        fontSize: 28,
        color: '#4caf50',
        marginBottom: 4,
    },
    summaryLabel: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    studentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    studentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    studentDetails: {
        flex: 1,
    },
    studentName: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    studentEmail: {
        fontFamily: "Nunito_400Regular",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    percentageContainer: {
        alignItems: 'flex-end',
    },
    percentageValue: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        marginBottom: 2,
    },
    attendanceCount: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    warningText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: '#FFFFFF',
        flex: 1,
    },
    coursesContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        paddingTop: 12,
    },
    coursesTitle: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    courseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    courseName: {
        fontFamily: "Nunito_400Regular",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        flex: 1,
        marginRight: 12,
    },
    courseStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    courseCount: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    coursePercentage: {
        fontFamily: "Nunito_700Bold",
        fontSize: 13,
        minWidth: 50,
        textAlign: 'right',
    },
    moreCoursesText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontStyle: 'italic',
        marginTop: 4,
    },
});
