import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../../services/auth.service';

interface Assignment {
    id: string;
    title: string;
    description: string;
    documentUrl: string | null;
    fileKey: string | null;
    fileUrl: string | null;
    dueDate: string;
    createdBy: {
        name: string;
    };
    submissions: {
        id: string;
        submittedAt: string;
        submissionUrl: string | null;
        fileKey: string | null;
        fileUrl: string | null;
    }[];
}

export default function StudentAssignmentsScreen() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<{uri: string; name: string; size: number} | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('all');

    const loadAssignments = async () => {
        try {
            const token = await authService.getToken();
            const response = await fetch('https://kelp-backend-fywm.onrender.com/api/assignments/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setAssignments(data.assignments || []);
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadAssignments();
    }, []);

    useEffect(() => {
        loadAssignments();
    }, []);

    const handleSubmitAssignment = async () => {
        if (!selectedAssignment) return;

        if (!submissionUrl.trim() && !selectedFile) {
            Alert.alert('Error', 'Please provide a submission URL or upload a file');
            return;
        }

        setSubmitting(true);
        try {
            const token = await authService.getToken();
            const rollNumber = await authService.getRollNumber();

            const formData = new FormData();
            formData.append('rollNumber', rollNumber || '');
            if (submissionUrl.trim()) {
                formData.append('submissionUrl', submissionUrl);
            }
            
            if (selectedFile) {
                formData.append('file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: 'application/pdf'
                } as any);
            }

            const response = await fetch(`https://kelp-backend-fywm.onrender.comywm.onrender.com/api/assignments/${selectedAssignment.id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok && data.success) {
                Alert.alert('Success', 'Assignment submitted successfully!');
                setShowSubmitModal(false);
                setSelectedAssignment(null);
                setSubmissionUrl('');
                setSelectedFile(null);
                loadAssignments();
            } else {
                Alert.alert('Error', data.error || 'Failed to submit assignment');
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            Alert.alert('Error', 'Failed to connect to server');
        } finally {
            setSubmitting(false);
        }
    };

    const openSubmitModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setSubmissionUrl('');
        setSelectedFile(null);
        setShowSubmitModal(true);
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

    const getDaysUntilDue = (dateString: string) => {
        const dueDate = new Date(dateString);
        const now = new Date();
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const isOverdue = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    const isSubmitted = (assignment: Assignment) => {
        return assignment.submissions && assignment.submissions.length > 0;
    };

    const getFilteredAssignments = () => {
        switch (filter) {
            case 'pending':
                return assignments.filter(a => !isSubmitted(a));
            case 'submitted':
                return assignments.filter(a => isSubmitted(a));
            default:
                return assignments;
        }
    };

    const filteredAssignments = getFilteredAssignments();

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
                <Text style={styles.headerTitle}>My Assignments</Text>
                <View style={styles.backButton} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All ({assignments.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
                        Pending ({assignments.filter(a => !isSubmitted(a)).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'submitted' && styles.filterTabActive]}
                    onPress={() => setFilter('submitted')}
                >
                    <Text style={[styles.filterText, filter === 'submitted' && styles.filterTextActive]}>
                        Submitted ({assignments.filter(a => isSubmitted(a)).length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Assignments List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading assignments...</Text>
                </View>
            ) : filteredAssignments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={64} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.emptyText}>
                        {filter === 'pending' ? 'No pending assignments' : 
                         filter === 'submitted' ? 'No submitted assignments' : 
                         'No assignments yet'}
                    </Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#FFFFFF"
                        />
                    }
                >
                    {filteredAssignments.map((assignment) => {
                        const submitted = isSubmitted(assignment);
                        const overdue = isOverdue(assignment.dueDate);
                        const daysUntil = getDaysUntilDue(assignment.dueDate);

                        return (
                            <View key={assignment.id} style={styles.assignmentCard}>
                                <View style={styles.assignmentHeader}>
                                    <View style={[
                                        styles.statusBadge, 
                                        submitted ? styles.statusBadgeSubmitted : 
                                        overdue ? styles.statusBadgeOverdue : 
                                        styles.statusBadgePending
                                    ]}>
                                        <Ionicons 
                                            name={submitted ? "checkmark-circle" : overdue ? "alert-circle" : "time"} 
                                            size={14} 
                                            color={submitted ? "#66bb6a" : overdue ? "#ef5350" : "#ffa726"} 
                                        />
                                        <Text style={[
                                            styles.statusText,
                                            submitted && styles.statusTextSubmitted,
                                            overdue && styles.statusTextOverdue
                                        ]}>
                                            {submitted ? 'Submitted' : overdue ? 'Overdue' : `${daysUntil} days left`}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                                <Text style={styles.assignmentDescription} numberOfLines={3}>
                                    {assignment.description}
                                </Text>
                                
                                <View style={styles.assignmentDetails}>
                                    <View style={styles.assignmentDetail}>
                                        <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.assignmentDetailText}>
                                            Due: {formatDate(assignment.dueDate)}
                                        </Text>
                                    </View>
                                    {assignment.documentUrl && (
                                        <TouchableOpacity 
                                            style={styles.assignmentDetail}
                                            onPress={() => {
                                                if (assignment.documentUrl) {
                                                    Linking.openURL(assignment.documentUrl).catch(() => 
                                                        Alert.alert('Error', 'Failed to open document')
                                                    );
                                                }
                                            }}
                                        >
                                            <Ionicons name="link" size={16} color="#4fc3f7" />
                                            <Text style={[styles.assignmentDetailText, { color: '#4fc3f7' }]}>
                                                View Document Link
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {assignment.fileUrl && (
                                        <TouchableOpacity 
                                            style={styles.assignmentDetail}
                                            onPress={() => {
                                                if (assignment.fileUrl) {
                                                    Linking.openURL(assignment.fileUrl).catch(() => 
                                                        Alert.alert('Error', 'Failed to open file')
                                                    );
                                                }
                                            }}
                                        >
                                            <Ionicons name="document-text" size={16} color="#4fc3f7" />
                                            <Text style={[styles.assignmentDetailText, { color: '#4fc3f7' }]}>
                                                📄 Download Assignment PDF
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <View style={styles.assignmentDetail}>
                                        <Ionicons name="person" size={16} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.assignmentDetailText}>
                                            By {assignment.createdBy.name}
                                        </Text>
                                    </View>
                                    {submitted && assignment.submissions[0] && (
                                        <View style={styles.submissionInfo}>
                                            <View style={styles.assignmentDetail}>
                                                <Ionicons name="checkmark-done" size={16} color="#66bb6a" />
                                                <Text style={[styles.assignmentDetailText, { color: '#66bb6a' }]}>
                                                    Submitted on {formatDate(assignment.submissions[0].submittedAt)}
                                                </Text>
                                            </View>
                                            {assignment.submissions[0].fileUrl && (
                                                <TouchableOpacity 
                                                    style={styles.assignmentDetail}
                                                    onPress={() => {
                                                        if (assignment.submissions[0].fileUrl) {
                                                            Linking.openURL(assignment.submissions[0].fileUrl).catch(() => 
                                                                Alert.alert('Error', 'Failed to open file')
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Ionicons name="cloud-download" size={16} color="#66bb6a" />
                                                    <Text style={[styles.assignmentDetailText, { color: '#66bb6a' }]}>
                                                        View My Submission
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>

                                {!submitted && (
                                    <TouchableOpacity 
                                        style={[styles.submitButton, overdue && styles.submitButtonDisabled]}
                                        onPress={() => !overdue && openSubmitModal(assignment)}
                                        disabled={overdue}
                                    >
                                        <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                                        <Text style={styles.submitButtonText}>
                                            {overdue ? 'Submission Closed' : 'Submit Assignment'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* Submit Modal */}
            <Modal
                visible={showSubmitModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSubmitModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Submit Assignment</Text>
                            <TouchableOpacity onPress={() => setShowSubmitModal(false)}>
                                <Ionicons name="close" size={24} color="#004d40" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {selectedAssignment && (
                                <View style={styles.assignmentInfo}>
                                    <Text style={styles.assignmentInfoTitle}>{selectedAssignment.title}</Text>
                                    <Text style={styles.assignmentInfoDue}>
                                        Due: {formatDate(selectedAssignment.dueDate)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Submission URL (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="https://github.com/yourusername/project"
                                    placeholderTextColor="rgba(0,77,64,0.4)"
                                    value={submissionUrl}
                                    onChangeText={setSubmissionUrl}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Upload PDF File</Text>
                                {selectedFile ? (
                                    <View style={styles.filePreview}>
                                        <View style={styles.fileInfo}>
                                            <Ionicons name="document-text" size={24} color="#004d40" />
                                            <View style={styles.fileDetails}>
                                                <Text style={styles.fileName}>{selectedFile.name}</Text>
                                                <Text style={styles.fileSize}>
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.removeFileButton}
                                            onPress={() => setSelectedFile(null)}
                                        >
                                            <Ionicons name="close-circle" size={24} color="#d32f2f" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity 
                                        style={styles.filePickerButton}
                                        onPress={async () => {
                                            try {
                                                const result = await DocumentPicker.getDocumentAsync({
                                                    type: 'application/pdf',
                                                    copyToCacheDirectory: true
                                                });
                                                
                                                if (result.canceled === false && result.assets && result.assets[0]) {
                                                    const file = result.assets[0];
                                                    if (file.size && file.size > 50 * 1024 * 1024) {
                                                        Alert.alert('Error', 'File size must be less than 50MB');
                                                        return;
                                                    }
                                                    setSelectedFile({
                                                        uri: file.uri,
                                                        name: file.name,
                                                        size: file.size || 0
                                                    });
                                                }
                                            } catch (error) {
                                                console.error('Error picking file:', error);
                                                Alert.alert('Error', 'Failed to pick file');
                                            }
                                        }}
                                    >
                                        <Ionicons name="cloud-upload-outline" size={24} color="#004d40" />
                                        <Text style={styles.filePickerButtonText}>Choose PDF File</Text>
                                        <Text style={styles.filePickerHint}>(Max 50MB)</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitModalButton, submitting && styles.submitModalButtonDisabled]}
                                onPress={handleSubmitAssignment}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                        <Text style={styles.submitModalButtonText}>Submit Assignment</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
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
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    filterText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
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
        gap: 16,
    },
    emptyText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        gap: 16,
    },
    assignmentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    assignmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgePending: {
        backgroundColor: 'rgba(255, 167, 38, 0.2)',
    },
    statusBadgeOverdue: {
        backgroundColor: 'rgba(239, 83, 80, 0.2)',
    },
    statusBadgeSubmitted: {
        backgroundColor: 'rgba(102, 187, 106, 0.2)',
    },
    statusText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: '#ffa726',
    },
    statusTextOverdue: {
        color: '#ef5350',
    },
    statusTextSubmitted: {
        color: '#66bb6a',
    },
    assignmentTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    assignmentDescription: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 12,
        lineHeight: 20,
    },
    assignmentDetails: {
        gap: 6,
        marginBottom: 12,
    },
    assignmentDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    assignmentDetailText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    submissionInfo: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        gap: 6,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#00897b',
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.5,
        backgroundColor: '#666',
    },
    submitButtonText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 15,
        color: '#FFFFFF',
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
        maxHeight: '85%',
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
    assignmentInfo: {
        backgroundColor: 'rgba(0, 77, 64, 0.05)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    assignmentInfoTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#004d40',
        marginBottom: 4,
    },
    assignmentInfoDue: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: 'rgba(0, 77, 64, 0.6)',
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(0, 77, 64, 0.2)',
    },
    dividerText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: 'rgba(0, 77, 64, 0.5)',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 77, 64, 0.05)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 77, 64, 0.2)',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: '#004d40',
        marginBottom: 2,
    },
    fileSize: {
        fontFamily: "Nunito_400Regular",
        fontSize: 12,
        color: 'rgba(0, 77, 64, 0.6)',
    },
    removeFileButton: {
        padding: 4,
    },
    filePickerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 77, 64, 0.05)',
        padding: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(0, 77, 64, 0.2)',
        borderStyle: 'dashed',
    },
    filePickerButtonText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 15,
        color: '#004d40',
    },
    filePickerHint: {
        fontFamily: "Nunito_400Regular",
        fontSize: 12,
        color: 'rgba(0, 77, 64, 0.5)',
    },
    submitModalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#00897b',
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
    },
    submitModalButtonDisabled: {
        opacity: 0.6,
    },
    submitModalButtonText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 16,
        color: '#FFFFFF',
    },
});
