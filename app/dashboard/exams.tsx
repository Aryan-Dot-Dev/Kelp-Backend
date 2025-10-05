import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../../services/auth.service';

interface Exam {
    id: string;
    title: string;
    date: string;
    type: 'MIDSEM' | 'ENDSEM';
    createdBy: {
        name: string;
        email: string;
    };
}

export default function Exams() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [userData, setUserData] = useState<any>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [upcomingExam, setUpcomingExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [formData, setFormData] = useState({
        title: '',
        type: 'MIDSEM' as 'MIDSEM' | 'ENDSEM'
    });
    const [submitting, setSubmitting] = useState(false);

    const loadUserData = async () => {
        try {
            const data = await authService.getUserData();
            setUserData(data);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadExams = async () => {
        try {
            const token = await authService.getToken();
            const response = await fetch('https://kelp-backend-fywm.onrender.com/api/exams/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setExams(data.exams || []);
                findUpcomingExam(data.exams || []);
            }
        } catch (error) {
            console.error('Error loading exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadData = useCallback(async () => {
        await loadUserData();
        await loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddExam = async () => {
        if (!formData.title) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = await authService.getToken();
            const response = await fetch('https://kelp-backend-fywm.onrender.comywm.onrender.com/api/exams/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    date: selectedDate.toISOString(),
                    type: formData.type
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                Alert.alert('Success', 'Exam added successfully!');
                setShowAddModal(false);
                setFormData({ title: '', type: 'MIDSEM' });
                setSelectedDate(new Date());
                loadExams();
            } else {
                Alert.alert('Error', data.error || 'Failed to add exam');
            }
        } catch (error) {
            console.error('Error adding exam:', error);
            Alert.alert('Error', 'Failed to connect to server');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteExam = async (examId: string) => {
        Alert.alert(
            'Delete Exam',
            'Are you sure you want to delete this exam?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await authService.getToken();
                            const response = await fetch(`https://kelp-backend-fywm.onrender.comywm.onrender.com/api/exams/${examId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            const data = await response.json();
                            if (response.ok && data.success) {
                                Alert.alert('Success', 'Exam deleted successfully!');
                                loadExams();
                            } else {
                                Alert.alert('Error', data.error || 'Failed to delete exam');
                            }
                        } catch (error) {
                            console.error('Error deleting exam:', error);
                            Alert.alert('Error', 'Failed to connect to server');
                        }
                    }
                }
            ]
        );
    };

    const findUpcomingExam = (examList: Exam[]) => {
        const now = new Date();
        const futureExams = examList
            .filter(exam => new Date(exam.date) > now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setUpcomingExam(futureExams.length > 0 ? futureExams[0] : null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysUntilExam = (dateString: string) => {
        const examDate = new Date(dateString);
        const now = new Date();
        const diffTime = examDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (!fontsLoaded) return null;

    const isCR = userData?.role === 'CR';

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
                <Text style={styles.headerTitle}>Exams</Text>
                {isCR && (
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                )}
                {!isCR && <View style={styles.backButton} />}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading exams...</Text>
                </View>
            ) : exams.length === 0 ? (
                <View style={styles.placeholderContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="calendar-outline" size={64} color="rgba(255,255,255,0.9)" />
                    </View>
                    
                    <Text style={styles.placeholderTitle}>No Exams Scheduled</Text>
                    
                    <Text style={styles.placeholderDescription}>
                        {isCR 
                            ? 'Tap the + button to add an exam schedule for your class.'
                            : 'Your exam schedule will appear here once your Class Representative adds them.'}
                    </Text>

                    {!isCR && (
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Ionicons name="information-circle" size={20} color="#4db6ac" />
                                <Text style={styles.infoText}>
                                    Only CR can add exam schedules
                                </Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.footerNote}>
                        📚 Stay prepared, stay ahead
                    </Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Upcoming Exam Highlight */}
                    {upcomingExam && (
                        <View style={styles.upcomingExamBanner}>
                            <View style={styles.upcomingBadge}>
                                <Ionicons name="alert-circle" size={20} color="#FFA726" />
                                <Text style={styles.upcomingBadgeText}>NEXT EXAM</Text>
                            </View>
                            <Text style={styles.upcomingExamTitle}>{upcomingExam.title}</Text>
                            <View style={styles.upcomingExamInfo}>
                                <View style={styles.upcomingDetail}>
                                    <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.8)" />
                                    <Text style={styles.upcomingDetailText}>{formatDate(upcomingExam.date)}</Text>
                                </View>
                                <View style={styles.upcomingCountdown}>
                                    <Text style={styles.countdownNumber}>{getDaysUntilExam(upcomingExam.date)}</Text>
                                    <Text style={styles.countdownLabel}>days left</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {exams.map((exam) => (
                        <View key={exam.id} style={[
                            styles.examCard,
                            upcomingExam?.id === exam.id && styles.examCardUpcoming
                        ]}>
                            <View style={styles.examHeader}>
                                <View style={styles.examTypeBadge}>
                                    <Ionicons 
                                        name={exam.type === 'MIDSEM' ? 'book-outline' : 'school-outline'} 
                                        size={16} 
                                        color="#4db6ac" 
                                    />
                                    <Text style={styles.examType}>{exam.type}</Text>
                                </View>
                                {isCR && (
                                    <TouchableOpacity 
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteExam(exam.id)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ef5350" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Text style={styles.examTitle}>{exam.title}</Text>
                            
                            <View style={styles.examDetails}>
                                <View style={styles.examDetail}>
                                    <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.examDetailText}>{formatDate(exam.date)}</Text>
                                </View>
                                <View style={styles.examDetail}>
                                    <Ionicons name="person" size={16} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.examDetailText}>Added by {exam.createdBy.name}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Add Exam Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Exam</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color="#004d40" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Exam Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Mid-Semester Exam"
                                    placeholderTextColor="rgba(0,77,64,0.4)"
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({...formData, title: text})}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Date & Time</Text>
                                <View style={styles.dateTimeContainer}>
                                    <TouchableOpacity 
                                        style={styles.dateTimeButton}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Ionicons name="calendar-outline" size={20} color="#004d40" />
                                        <Text style={styles.dateTimeButtonText}>
                                            {selectedDate.toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                day: 'numeric', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.dateTimeButton}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Ionicons name="time-outline" size={20} color="#004d40" />
                                        <Text style={styles.dateTimeButtonText}>
                                            {selectedDate.toLocaleTimeString('en-US', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, date) => {
                                            setShowDatePicker(Platform.OS === 'ios');
                                            if (date) setSelectedDate(date);
                                        }}
                                        minimumDate={new Date()}
                                    />
                                )}

                                {showTimePicker && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="time"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, date) => {
                                            setShowTimePicker(Platform.OS === 'ios');
                                            if (date) setSelectedDate(date);
                                        }}
                                    />
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Exam Type</Text>
                                <View style={styles.typeButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeButton,
                                            formData.type === 'MIDSEM' && styles.typeButtonActive
                                        ]}
                                        onPress={() => setFormData({...formData, type: 'MIDSEM'})}
                                    >
                                        <Ionicons 
                                            name="book-outline" 
                                            size={20} 
                                            color={formData.type === 'MIDSEM' ? '#FFFFFF' : '#004d40'} 
                                        />
                                        <Text style={[
                                            styles.typeButtonText,
                                            formData.type === 'MIDSEM' && styles.typeButtonTextActive
                                        ]}>
                                            Mid-Sem
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.typeButton,
                                            formData.type === 'ENDSEM' && styles.typeButtonActive
                                        ]}
                                        onPress={() => setFormData({...formData, type: 'ENDSEM'})}
                                    >
                                        <Ionicons 
                                            name="school-outline" 
                                            size={20} 
                                            color={formData.type === 'ENDSEM' ? '#FFFFFF' : '#004d40'} 
                                        />
                                        <Text style={[
                                            styles.typeButtonText,
                                            formData.type === 'ENDSEM' && styles.typeButtonTextActive
                                        ]}>
                                            End-Sem
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={handleAddExam}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                        <Text style={styles.submitButtonText}>Add Exam</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    headerTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        color: '#FFFFFF',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 20,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 10,
    },
    placeholderTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 26,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    placeholderDescription: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: '#FFFFFF',
        flex: 1,
    },
    featuresList: {
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    featureBullet: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        flex: 1,
    },
    footerNote: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        marginTop: 12,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4caf50',
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    examCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    examHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    examTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(77, 182, 172, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4db6ac',
    },
    examType: {
        fontFamily: "Nunito_700Bold",
        fontSize: 12,
        color: '#4db6ac',
        textTransform: 'uppercase',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(239, 83, 80, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    examTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    examDetails: {
        gap: 8,
    },
    examDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    examDetailText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 77, 64, 0.1)',
    },
    modalTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 22,
        color: '#004d40',
    },
    modalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: '#004d40',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(0, 77, 64, 0.05)',
        borderRadius: 12,
        padding: 16,
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: '#004d40',
        borderWidth: 1,
        borderColor: 'rgba(0, 77, 64, 0.1)',
    },
    typeButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 77, 64, 0.05)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(0, 77, 64, 0.2)',
    },
    typeButtonActive: {
        backgroundColor: '#00897b',
        borderColor: '#00897b',
    },
    typeButtonText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: '#004d40',
    },
    typeButtonTextActive: {
        color: '#FFFFFF',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#00897b',
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#FFFFFF',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateTimeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 77, 64, 0.05)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 77, 64, 0.2)',
    },
    dateTimeButtonText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: '#004d40',
        flex: 1,
    },
    upcomingExamBanner: {
        backgroundColor: 'rgba(255, 167, 38, 0.15)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 167, 38, 0.4)',
    },
    upcomingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    upcomingBadgeText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 12,
        color: '#FFA726',
        letterSpacing: 1,
    },
    upcomingExamTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 22,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    upcomingExamInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    upcomingDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    upcomingDetailText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        flex: 1,
    },
    upcomingCountdown: {
        backgroundColor: 'rgba(255, 167, 38, 0.3)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    countdownNumber: {
        fontFamily: "Nunito_700Bold",
        fontSize: 28,
        color: '#FFA726',
    },
    countdownLabel: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    examCardUpcoming: {
        borderWidth: 2,
        borderColor: 'rgba(255, 167, 38, 0.3)',
    },
});
