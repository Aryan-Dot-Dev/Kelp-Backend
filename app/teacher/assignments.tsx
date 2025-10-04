import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
        email: string;
    };
    _count: {
        submissions: number;
    };
}

export default function Assignments() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        documentUrl: ''
    });
    const [selectedFile, setSelectedFile] = useState<{uri: string; name: string; size: number} | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadAssignments = async () => {
        try {
            const token = await authService.getToken();
            const response = await fetch('http://localhost:5000/api/assignments/list', {
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
        }
    };

    const loadData = useCallback(async () => {
        await loadAssignments();
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddAssignment = async () => {
        if (!formData.title || !formData.description) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = await authService.getToken();
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            if (formData.documentUrl) {
                formDataToSend.append('documentUrl', formData.documentUrl);
            }
            formDataToSend.append('dueDate', selectedDate.toISOString());
            
            if (selectedFile) {
                formDataToSend.append('file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: 'application/pdf'
                } as any);
            }

            const response = await fetch('http://localhost:5000/api/assignments/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();
            if (response.ok && data.success) {
                Alert.alert('Success', 'Assignment created successfully!');
                setShowAddModal(false);
                setFormData({ title: '', description: '', documentUrl: '' });
                setSelectedDate(new Date());
                setSelectedFile(null);
                loadAssignments();
            } else {
                Alert.alert('Error', data.error || 'Failed to create assignment');
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            Alert.alert('Error', 'Failed to connect to server');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditAssignment = async () => {
        if (!editingAssignment || !formData.title || !formData.description) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = await authService.getToken();
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            if (formData.documentUrl) {
                formDataToSend.append('documentUrl', formData.documentUrl);
            }
            formDataToSend.append('dueDate', selectedDate.toISOString());
            
            if (selectedFile) {
                formDataToSend.append('file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: 'application/pdf'
                } as any);
            }

            const response = await fetch(`http://localhost:5000/api/assignments/${editingAssignment.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();
            if (response.ok && data.success) {
                Alert.alert('Success', 'Assignment updated successfully!');
                setShowEditModal(false);
                setEditingAssignment(null);
                setFormData({ title: '', description: '', documentUrl: '' });
                setSelectedDate(new Date());
                setSelectedFile(null);
                loadAssignments();
            } else {
                Alert.alert('Error', data.error || 'Failed to update assignment');
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
            Alert.alert('Error', 'Failed to connect to server');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId: string) => {
        Alert.alert(
            'Delete Assignment',
            'Are you sure you want to delete this assignment? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await authService.getToken();
                            const response = await fetch(`http://localhost:5000/api/assignments/${assignmentId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            const data = await response.json();
                            if (response.ok && data.success) {
                                Alert.alert('Success', 'Assignment deleted successfully!');
                                loadAssignments();
                            } else {
                                Alert.alert('Error', data.error || 'Failed to delete assignment');
                            }
                        } catch (error) {
                            console.error('Error deleting assignment:', error);
                            Alert.alert('Error', 'Failed to connect to server');
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (assignment: Assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            documentUrl: assignment.documentUrl || ''
        });
        setSelectedDate(new Date(assignment.dueDate));
        setSelectedFile(null); // Reset file selection when editing
        setShowEditModal(true);
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

    const renderAssignmentModal = (isEdit: boolean) => (
        <Modal
            visible={isEdit ? showEditModal : showAddModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {isEdit ? 'Edit Assignment' : 'Create Assignment'}
                        </Text>
                        <TouchableOpacity onPress={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}>
                            <Ionicons name="close" size={24} color="#004d40" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter assignment title"
                                placeholderTextColor="rgba(0,77,64,0.4)"
                                value={formData.title}
                                onChangeText={(text) => setFormData({...formData, title: text})}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Description *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter assignment description and requirements"
                                placeholderTextColor="rgba(0,77,64,0.4)"
                                value={formData.description}
                                onChangeText={(text) => setFormData({...formData, description: text})}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Document URL (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://example.com/document.pdf"
                                placeholderTextColor="rgba(0,77,64,0.4)"
                                value={formData.documentUrl}
                                onChangeText={(text) => setFormData({...formData, documentUrl: text})}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Attach PDF File (Optional)</Text>
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
                                    <Ionicons name="cloud-upload-outline" size={20} color="#004d40" />
                                    <Text style={styles.filePickerButtonText}>Choose PDF File</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Due Date & Time *</Text>
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

                        <TouchableOpacity 
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={isEdit ? handleEditAssignment : handleAddAssignment}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name={isEdit ? "save" : "add-circle"} size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>
                                        {isEdit ? 'Update Assignment' : 'Create Assignment'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

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
                <Text style={styles.headerTitle}>Assignments</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading assignments...</Text>
                </View>
            ) : assignments.length === 0 ? (
                <View style={styles.placeholderContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="document-text-outline" size={64} color="rgba(255,255,255,0.9)" />
                    </View>
                    
                    <Text style={styles.placeholderTitle}>No Assignments Created</Text>
                    
                    <Text style={styles.placeholderDescription}>
                        Tap the + button to create your first assignment for students.
                    </Text>

                    <Text style={styles.footerNote}>
                        📝 Keep students engaged with assignments
                    </Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {assignments.map((assignment) => {
                        const daysUntil = getDaysUntilDue(assignment.dueDate);
                        const overdue = isOverdue(assignment.dueDate);

                        return (
                            <View key={assignment.id} style={[
                                styles.assignmentCard,
                                overdue && styles.assignmentCardOverdue
                            ]}>
                                <View style={styles.assignmentHeader}>
                                    <View style={styles.statusBadge}>
                                        <Ionicons 
                                            name={overdue ? "close-circle" : "time"} 
                                            size={16} 
                                            color={overdue ? "#ef5350" : "#4db6ac"} 
                                        />
                                        <Text style={[
                                            styles.statusText,
                                            overdue && styles.statusTextOverdue
                                        ]}>
                                            {overdue ? 'Overdue' : `${daysUntil} days left`}
                                        </Text>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity 
                                            style={styles.editButton}
                                            onPress={() => openEditModal(assignment)}
                                        >
                                            <Ionicons name="create-outline" size={20} color="#2196F3" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteAssignment(assignment.id)}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#ef5350" />
                                        </TouchableOpacity>
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
                                        <View style={styles.assignmentDetail}>
                                            <Ionicons name="link" size={16} color="rgba(255,255,255,0.7)" />
                                            <Text style={styles.assignmentDetailText}>Document attached</Text>
                                        </View>
                                    )}
                                    {assignment.fileUrl && (
                                        <TouchableOpacity 
                                            style={styles.assignmentDetail}
                                            onPress={() => {
                                                if (assignment.fileUrl) {
                                                    Linking.openURL(assignment.fileUrl).catch(err => 
                                                        Alert.alert('Error', 'Failed to open file')
                                                    );
                                                }
                                            }}
                                        >
                                            <Ionicons name="document-text" size={16} color="#4fc3f7" />
                                            <Text style={[styles.assignmentDetailText, { color: '#4fc3f7' }]}>
                                                📄 Download PDF
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <View style={styles.assignmentDetail}>
                                        <Ionicons name="people" size={16} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.assignmentDetailText}>
                                            {assignment._count.submissions} submissions
                                        </Text>
                                    </View>
                                    <View style={styles.assignmentDetail}>
                                        <Ionicons name="person" size={16} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.assignmentDetailText}>
                                            By {assignment.createdBy.name}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* Modals */}
            {renderAssignmentModal(false)}
            {renderAssignmentModal(true)}
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
        fontSize: 20,
        color: '#FFFFFF',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
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
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    placeholderTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    placeholderDescription: {
        fontFamily: "Nunito_400Regular",
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    footerNote: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    assignmentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    assignmentCardOverdue: {
        borderColor: 'rgba(239, 83, 80, 0.4)',
        borderWidth: 2,
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: '#4db6ac',
    },
    statusTextOverdue: {
        color: '#ef5350',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(239, 83, 80, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 77, 64, 0.05)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(0, 77, 64, 0.2)',
        borderStyle: 'dashed',
    },
    filePickerButtonText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: '#004d40',
    },
});
