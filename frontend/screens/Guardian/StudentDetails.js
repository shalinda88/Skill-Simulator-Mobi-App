import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image, Alert, Modal, KeyboardAvoidingView, TextInput,Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Color';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import DateTimePicker from "@react-native-community/datetimepicker"; // Assuming you have this defined

export default function StudentDetails({ route, navigation }) {

    
    const { student } = route.params;
    const [activeTab, setActiveTab] = useState('profile');
    const [studentProgress, setStudentProgress] = useState(null);
    const [overallProgress, setOverallProgress] = useState(0);
    const [isLoading,setIsLoading] = useState(true);
    const [modalVisible,setModalVisible] = useState(null);
    const [editStudent,setEditStudent] = useState({
        name: student.fullName,
        email: student.email,
        dob: student.dob ? new Date(student.dob) : null,
        address: student.address || '',
        password: '', // Leave blank unless changed
        fingerprintData: student.fingerprintData,
        faceData: student.faceData
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [faceImage, setFaceImage] = useState(student.faceData);


    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || editStudent.dob;
        setShowDatePicker(Platform.OS === 'ios');
        setEditStudent({...editStudent, dob: currentDate});
    };
    // Function to Scan Fingerprint
    const scanFingerprint = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled){
            Alert.alert('Error','Biometric authentication is not available on this device');
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage:'Scan your fingerprint',
            cancelLabel:'Cancel'
        });
        if (result.success){
            Alert.alert('Success','Fingerprint captured successfully!')
            setEditStudent({ ...editStudent, fingerprintData: 'Fingerprint_Scanned' });
        }else{
            Alert.alert('Failed','Fingerprint scan failed. Try again')
        }
    };

    // Function for Capture Face Data
    const captureFaceData = async () => {
        const permission = await Camera.requestCameraPermission();
        if (permission !== 'authorized'){
            Alert.alert('Error','Camera permission is required to capture')
            return;
        }

        const camera = new Camera();
        const photo = await camera.takePhoto({});
        setFaceImage(photo.path);
        setEditStudent({...editStudent,faceData: photo.path,});
        Alert.alert('Success','Face data captured successfully')
    }

    const calculateOverallProgress = (userProgress) => {
        // Check if userProgress exists and has necessary properties
        if (!userProgress || !userProgress.progress || !userProgress.skillGames) {
            return 0;
        }
        // Define the skills and their corresponding game keys
        const skillModules = [
            {
                skillKey: 'roadCrossing',
                gameKey: 'roadCrossingGame'
            },
            {
                skillKey: 'publicTransport',
                gameKey: 'publicTransportGame'
            },
            {
                skillKey: 'shopping',
                gameKey: 'shoppingGame'
            }
        ];
        // Calculate total progress
        let totalProgress = 0;
        let moduleCount = 0;
        skillModules.forEach(({ skillKey, gameKey }) => {
            // Get progress for skill module and skill game
            const skillProgress = userProgress.progress[skillKey] || 0;
            const gameProgress = userProgress.skillGames[gameKey] || 0;
            // Calculate average progress for this module
            const moduleProgress = (skillProgress + gameProgress) / 2;
            totalProgress += moduleProgress;
            moduleCount++;
        });
        // Calculate overall progress
        const overallProgress = moduleCount > 0
            ? Math.round(totalProgress / moduleCount)
            : 0;
        return overallProgress;
    };
    


    useEffect(() => {
        fetchStudentProgress();
    }, []);

    const fetchStudentProgress = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token){
                navigation.navigate('Login');
                return;
            }
            const response = await axios.get(`https://skill-share-281536e63f1e.herokuapp.com/api/progress/${student._id}`,{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setStudentProgress(response.data);

            const calculatedOverallProgress = calculateOverallProgress(response.data);
            setOverallProgress(calculatedOverallProgress);
            
            setIsLoading(false);
        }catch (error){
            console.error('Error fetching student progress:',error);
            setIsLoading(false);
        }
    };

    const updateStudent = async () => {
        try {
            if (!editStudent.name || !editStudent.email){
                Alert.alert('Error','Name and Email are required');
                return;
            }

            const updateData = {
                fullName:editStudent.name,
                email:editStudent.email,
                dob:editStudent.dob,
                address:editStudent.address,
                ...(editStudent.password && { password: editStudent.password }),
                fingerprintData: editStudent.fingerprintData,
                faceData: editStudent.faceData
            };
            const response = await axios.put(`http://10.0.2.2:5000/api/users/${student._id}`,updateData);
            Alert.alert('Success','Student information updated successfully');
            setModalVisible(false);
            navigation.setParams({
                student: { ...student, ...updateData }
            });
        }catch (error){
            console.error('Update Error:', error.response ? error.response.data : error);
            Alert.alert(
                'Update Failed',
                error.response?.data?.message || 'An error occurred during update'
            );
        }
    }

    const renderEditModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={styles.modalContent}>
                        <ScrollView
                            contentContainerStyle={styles.scrollViewContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.modalTitle}>Edit Student Profile</Text>

                            <Text style={styles.inputLabel}>Name*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter student name"
                                value={editStudent.name}
                                onChangeText={(text) => setEditStudent({...editStudent, name: text})}
                            />

                            <Text style={styles.inputLabel}>Email Address*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email address"
                                keyboardType="email-address"
                                value={editStudent.email}
                                onChangeText={(text) => setEditStudent({...editStudent, email: text})}
                            />

                            <Text style={styles.inputLabel}>Date of Birth</Text>
                            <TouchableOpacity
                                style={styles.datePickerInput}
                                onPress={showDatepicker}
                            >
                                <Text style={editStudent.dob ? styles.datePickerText : styles.datePickerPlaceholderText}>
                                    {editStudent.dob
                                        ? editStudent.dob.toLocaleDateString()
                                        : 'Select Date of Birth'}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={editStudent.dob || new Date()}
                                    mode="date"
                                    is24Hour={true}
                                    display="default"
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                    minimumDate={new Date(1990, 0, 1)}
                                />
                            )}

                            <Text style={styles.inputLabel}>Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter address"
                                value={editStudent.address}
                                onChangeText={(text) => setEditStudent({...editStudent, address: text})}
                            />

                            <Text style={styles.inputLabel}>New Password (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                secureTextEntry
                                value={editStudent.password}
                                onChangeText={(text) => setEditStudent({...editStudent, password: text})}
                            />

                            <Text style={styles.inputLabel}>Fingerprint Data</Text>
                            <TouchableOpacity style={styles.biometricButton} onPress={scanFingerprint}>
                                <Ionicons name="finger-print-outline" size={24} color="#4A6FA5" />
                                <Text style={styles.biometricButtonText}>
                                    {editStudent.fingerprintData ? 'Update Fingerprint' : 'Scan Fingerprint'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.inputLabel}>Face Data</Text>
                            <TouchableOpacity style={styles.biometricButton} onPress={captureFaceData}>
                                <Ionicons name="camera-outline" size={24} color="#4A6FA5" />
                                <Text style={styles.biometricButtonText}>
                                    {editStudent.faceData ? 'Update Face Data' : 'Capture Face Data'}
                                </Text>
                            </TouchableOpacity>

                            {faceImage && <Image source={{uri:faceImage}} style={styles.facePreview}/>}

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton]}
                                    onPress={updateStudent}
                                >
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );


    // Helper function to get color based on progress
    const getProgressColor = (progress) => {
        if (progress >= 90) return '#4CAF50';
        if (progress >= 80) return '#2196F3';
        if (progress >= 70) return '#FFC107';
        return '#F44336';
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };





    const renderProfileTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.profileHeader}>
                <View style={styles.largeAvatar}>
                    <Text style={styles.largeAvatarText}>{getInitials(student.fullName)}</Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.studentFullName}>{student.fullName}</Text>
                    <Text style={styles.studentId}>ID: {student._id}</Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${overallProgress}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>{overallProgress}% Overall Progress</Text>
                </View>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{student.email || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Date of Birth: </Text>
                        <Text style={styles.infoValue}>{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <Text style={styles.infoValue}>{student.address || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.biometricSection}>
                    <Text style={styles.sectionTitle}>Security Information</Text>

                    <View style={styles.biometricItem}>
                        <Ionicons name="finger-print-outline" size={24} color="#4A6FA5" />
                        <Text style={styles.biometricText}>
                            {student.fingerprintData ? 'Fingerprint Registered' : 'No Fingerprint Data'}
                        </Text>
                    </View>

                    <View style={styles.biometricItem}>
                        <Ionicons name="person-outline" size={24} color="#4A6FA5" />
                        <Text style={styles.biometricText}>
                            {student.faceData ? 'Face Recognition Registered' : 'No Face Data'}
                        </Text>
                    </View>

                    <View style={styles.biometricItem}>
                        <Ionicons name="lock-closed-outline" size={24} color="#4A6FA5" />
                        <Text style={styles.biometricText}>
                            {student.password ? 'Password Set' : 'No Password Set'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderProgressTab = () => {
        if (isLoading) {
            return <Text>Loading progress...</Text>;
        }

        if (!studentProgress) {
            return <Text>No progress data available</Text>;
        }

        return (
            <View style={styles.tabContent}>
                <View style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>Overall Progress</Text>
                    <View style={styles.overallProgressContainer}>
                        <Text style={styles.overallProgressText}>
                            {overallProgress || 0}%
                        </Text>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>Skill Modules Progress</Text>
                    {Object.entries(studentProgress.progress || {}).map(([module, progress]) => (
                        <View key={module} style={styles.progressItem}>
                            <Text style={styles.progressLabel}>
                                {module.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Text>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${progress}%`,
                                            backgroundColor: getProgressColor(progress)
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.progressPercentage, { color: getProgressColor(progress) }]}>
                                {progress}%
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>Skill Games Progress</Text>
                    {Object.entries(studentProgress.skillGames || {}).map(([game, progress]) => (
                        <View key={game} style={styles.progressItem}>
                            <Text style={styles.progressLabel}>
                                {game.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Text>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${progress}%`,
                                            backgroundColor: getProgressColor(progress)
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.progressPercentage, { color: getProgressColor(progress) }]}>
                                {progress}%
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Details</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
                    onPress={() => setActiveTab('profile')}
                >
                    <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
                        Profile
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
                    onPress={() => setActiveTab('activities')}
                >
                    <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>
                        Activities
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'attendance' && renderAttendanceTab()}
                {activeTab === 'activities' && renderProgressTab()}
            </ScrollView>

            {renderEditModal()}

            {activeTab === 'profile' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.messageButton]}
                        onPress={()=>Alert.alert('Info','Stay Tuned')}
                    >
                        <Ionicons name="chatbox-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Message</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
    },
    moreButton: {
        padding: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4A6FA5',
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
    },
    activeTabText: {
        color: '#4A6FA5',
        fontFamily: 'Montserrat_600SemiBold',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4A6FA5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    largeAvatarText: {
        fontSize: 30,
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    studentFullName: {
        fontSize: 22,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 4,
    },
    studentId: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
    },
    infoSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 16,
    },
    infoRow: {
        marginBottom: 12,
    },
    infoItem: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#333',
    },
    biometricSection: {
        marginTop: 16,
    },
    biometricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    biometricText: {
        marginLeft: 12,
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#333',
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#4A6FA5',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginRight: 8,
    },
    messageButton: {
        backgroundColor: '#27AE60',
        marginRight: 0,
        marginLeft: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_500Medium',
        marginLeft: 8,
    },
    attendanceOverview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    attendanceCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginHorizontal: 4,
    },
    attendanceNumber: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#333',
        marginBottom: 8,
    },
    attendanceLabel: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
    },
    attendancePercentage: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    attendancePercentTitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginBottom: 16,
    },
    attendanceProgressBar: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        marginBottom: 8,
        overflow: 'hidden',
    },
    attendanceProgressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 5,
    },
    attendancePercentText: {
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
        color: '#333',
        textAlign: 'right',
    },
    recentAttendance: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    attendanceDay: {
        alignItems: 'center',
    },
    dayName: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginBottom: 8,
    },
    attendanceStatus: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 10,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
    },
    activityItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4A6FA5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 4,
    },
    activityDetail: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
        marginBottom: 8,
    },
    activityTime: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#999',
    },
    performanceSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    subjectPerformance: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    subjectName: {
        width: 100,
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#333',
    },
    subjectProgressContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginRight: 16,
        overflow: 'hidden',
    },
    subjectProgress: {
        height: '100%',
        borderRadius: 4,
    },
    subjectScore: {
        width: 40,
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
        textAlign: 'right',
    },
    progressSection: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15
    },

    overallProgressContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    overallProgressText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4A6FA5'
    },
    progressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    progressLabel: {
        flex: 2,
        fontSize: 14
    },
    progressBarContainer: {
        flex: 3,
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden'
    },

    progressPercentage: {
        flex: 1,
        textAlign: 'right',
        fontSize: 14,
        fontWeight: 'bold'
    },
    container:{
        flex:1,
        padding:16,
        paddingBottom:70,
        backgroundColor:COLORS?.BACKGROUND || '#f5f5f5',
    },
    greeting:{
        fontSize:21,
        fontWeight:'600',
        color:'#111',
        fontFamily:'Montserrat_600SemiBold',
        marginBottom:8
    },
    facePreview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 10
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    keyboardAvoidingView: {
        width: '90%',
        maxHeight: '90%'
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    subtitle:{
        fontSize:18,
        fontWeight:'600',
        color:'#111',
        fontFamily:'Montserrat_400Regular',
    },
    studentCards:{
        marginTop:20,
        flexDirection:'row',
        marginBottom:30
    },
    studentCard:{
        width:150,
        backgroundColor:COLORS?.BACKGROUND || '#f5f5f5',
        borderRadius:12,
        padding:20,
        marginRight:12,
        marginBottom:15,
        shadowColor:'#000',
        shadowOffset: {width:0,height:1},
        shadowOpacity:0.1,
        shadowRadius:4,
        elevation:2,
    },
    selectedStudentCard:{
        borderWidth:2,
        borderColor:'#4A6FA5',
    },
    addStudentCard:{
        width:150,
        backgroundColor:'#fff',
        borderRadius:12,
        padding:20,
        marginRight:12,
        shadowColor:'#000',
        shadowOffset:{width:0,height:1},
        shadowOpacity:0.1,
        shadowRadius:4,
        elevation:2,
        justifyContent:'center',
        alignItems:'center',
        borderStyle:'dashed',
        borderWidth:1,
        borderColor:'#4A6FA5'
    },
    addStudentText:{
        color:'#4A6FA5',
        fontWeight:'500',
        fontFamily:'Montserrat_400Regular',
        marginTop: 8
    },
    studentAvatar:{
        width:40,
        height:40,
        borderRadius:20,
        backgroundColor:'#4A6FA5',
        justifyContent:'center',
        alignItems:'center',
        marginBottom:12,
    },
    avatarText:{
        color:'#fff',
        fontSize:18,
        fontFamily:'Montserrat_600Regular',
    },
    studentName:{
        fontSize:16,
        color:'#333',
        marginBottom:4,
        fontFamily:'Montserrat_400Regular',
    },
    studentDetails:{
        fontSize:14,
        color:'#666',
        fontFamily:'Montserrat_400Regular',
        marginBottom:4,
    },
    card:{
        backgroundColor:'#fff',
        borderRadius:12,
        padding:16,
        marginBottom:20,
        shadowColor:'#000',
        shadowOffset:{width:0,height:1},
        shadowOpacity:0.1,
        shadowRadius:4,
        elevation:2,
    },
    cardTitle:{
        fontSize:18,
        fontFamily:'Montserrat_600SemiBold',
        color:'#333',
        marginBottom:10
    },
    previewText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Montserrat_400Regular',
        marginBottom: 12,
        fontStyle: 'italic'
    },
    previewInfo: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'Montserrat_400Regular',
        marginBottom: 6
    },
    viewDetailsButton: {
        backgroundColor: '#4A6FA5',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 12
    },
    viewDetailsText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
    },
    viewAllButton:{
        alignSelf:'center',
        marginTop:8,
        paddingVertical:8,
    },
    viewAllButtonText:{
        color:'#4A6FA5',
        fontWeight:'600',
        fontFamily:'Montserrat_400Regular'
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#4A6FA5',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center'
    },
    inputLabel: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        fontFamily: 'Montserrat_400Regular',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
    },
    datePicker: {
        width: '100%',
        marginBottom: 16,
    },
    datePickerInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        height: 50,
        justifyContent: 'center',
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
    },
    datePickerText: {
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
        color: '#000', // Default text color
    },
    datePickerPlaceholderText: {
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
        color: '#888', // Placeholder text color
    },
    datePickerIcon: {
        position: 'absolute',
        right: 10,
        top: 12,
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#4A6FA5',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    biometricButtonText: {
        color: '#4A6FA5',
        marginLeft: 8,
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        borderRadius: 8,
        padding: 12,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        backgroundColor: '#4A6FA5',
    },
    cancelButtonText: {
        color: '#555',
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
    }

});