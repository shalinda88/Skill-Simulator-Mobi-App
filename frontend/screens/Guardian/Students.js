
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    Platform,
    TouchableWithoutFeedback, Alert, Image, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS } from '../../constants/Color'; // Assuming you have this defined
import { useNavigation } from '@react-navigation/native'; // Import for navigation
import {Camera} from "react-native-vision-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";

export default function Students() {
    const navigation = useNavigation();
    const [students, setStudents] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        address: '',
        password: '',
        dob:null,
    });
    const [faceImage,setFaceImage] = useState(null);
    const [isLoading,setIsLoading] = useState(true);

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || newStudent.dob;
        setShowDatePicker(Platform.OS === 'ios');
        setNewStudent({...newStudent, dob: currentDate});
    };
    // Fetch students when component mounts
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const teacherData = await AsyncStorage.getItem('userData');
            const teacher = JSON.parse(teacherData);
            const response = await axios.get(`https://skill-share-281536e63f1e.herokuapp.com/api/users/teacher-students/${teacher.id}`);
            setStudents(response.data.data);
            setIsLoading(false);
        }catch (error) {
            console.error('Error fetching students:', error);
            Alert.alert('Error', 'Failed to fetch students');
            setIsLoading(false);
        }
    }


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
            setNewStudent({ ...newStudent, fingerprintData: 'Fingerprint_Scanned' });
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
        setNewStudent({...newStudent,faceData: photo.path});
        Alert.alert('Success','Face data captured successfully')
    }

    const addStudent = async () => {
        // Validate required fields
        if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.password.trim()) {
            Alert.alert('Error', 'Please enter required details');
            return;
        }

        try {
            // Retrieve teacher data from AsyncStorage
            const teacherData = await AsyncStorage.getItem('userData');
            const teacher = JSON.parse(teacherData);

            // Prepare student data payload
            const studentData = {
                fullName: newStudent.name, // Backend expects fullName, not name
                email: newStudent.email,
                password: newStudent.password,
                role: 'student',
                registeredBy: teacher.id,
                address: newStudent.address || '', // Optional field
                dob: newStudent.dob ? newStudent.dob.toISOString() : null, // Convert to ISO string if exists
                guardian: null, // Add if you have guardian logic
            };

            // Optional: Add biometric data if captured
            if (newStudent.fingerprintData) {
                studentData.fingerprintData = newStudent.fingerprintData;
            }
            if (newStudent.faceData) {
                studentData.faceData = newStudent.faceData;
            }

            // Send request to backend
            const response = await axios.post('https://skill-share-281536e63f1e.herokuapp.com/api/users/register-student', studentData);

            // Fetch updated student list
            await fetchStudents();

            // Reset modal and form
            setModalVisible(false);
            setNewStudent({
                name: '',
                email: '',
                address: '',
                password: '',
                dob: null,
                fingerprintData: '',
                faceData: ''
            });
            setFaceImage(null);

            Alert.alert('Success', 'Student added successfully');
        } catch (error) {
            console.error('Error adding student:', error.response ? error.response.data : error);

            // More detailed error handling
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                Alert.alert('Error', error.response.data.message || 'Failed to add student');
            } else if (error.request) {
                // The request was made but no response was received
                Alert.alert('Error', 'No response received from server');
            } else {
                // Something happened in setting up the request that triggered an Error
                Alert.alert('Error', 'Error preparing request');
            }
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    const navigateToStudentDetails = (student) => {
        navigation.navigate('StudentDetails', { student });
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };


    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading students...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.greeting}>Students</Text>
                <Text style={styles.subtitle}>Manage your students</Text>

                <View style={styles.studentCards}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {students.map(student => (
                            <TouchableOpacity
                                key={student._id}
                                style={[
                                    styles.studentCard,
                                    selectedStudent?._id === student._id && styles.selectedStudentCard
                                ]}
                                onPress={() => setSelectedStudent(student)}
                            >
                                <View style={styles.studentAvatar}>
                                    <Text style={styles.avatarText}>{getInitials(student.fullName)}</Text>
                                </View>
                                <Text style={styles.studentName}>{student.fullName}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.addStudentCard}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="add-circle-outline" size={32} color="#4A6FA5" />
                            <Text style={styles.addStudentText}>Add Student</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {selectedStudent && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Student Preview</Text>
                        <Text style={styles.previewText}>Click on student card to view full details</Text>
                        <Text style={styles.previewInfo}>Name: {selectedStudent.fullName || 'N/A'}</Text>
                        <Text style={styles.previewInfo}>Email: {selectedStudent.email || 'N/A'}</Text>
                        <Text style={styles.previewInfo}>Date of Birth: {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : 'N/A'}</Text>
                        {selectedStudent.address ? (
                            <Text style={styles.previewInfo}>Address: {selectedStudent.address}</Text>
                        ) : null}
                        <TouchableOpacity
                            style={styles.viewDetailsButton}
                            onPress={() => navigateToStudentDetails(selectedStudent)}
                        >
                            <Text style={styles.viewDetailsText}>View Full Details</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Add Student Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
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
                                        <Text style={styles.modalTitle}>Add New Student</Text>

                                        <Text style={styles.inputLabel}>Name*</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter student name"
                                            value={newStudent.name}
                                            onChangeText={(text) => setNewStudent({...newStudent, name: text})}
                                        />

                                        <Text style={styles.inputLabel}>Email Address*</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter email address"
                                            keyboardType="email-address"
                                            value={newStudent.email}
                                            onChangeText={(text) => setNewStudent({...newStudent, email: text})}
                                        />

                                        <Text style={styles.inputLabel}>Date of Birth</Text>
                                        <TouchableOpacity
                                            style={styles.datePickerInput}
                                            onPress={showDatepicker}
                                        >
                                            <Text style={newStudent.dob ? styles.datePickerText : styles.datePickerPlaceholderText}>
                                                {newStudent.dob
                                                    ? newStudent.dob.toLocaleDateString()
                                                    : 'Select Date of Birth'}
                                            </Text>
                                        </TouchableOpacity>

                                        {showDatePicker && (
                                            <DateTimePicker
                                                testID="dateTimePicker"
                                                value={newStudent.dob || new Date()}
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
                                            value={newStudent.address}
                                            onChangeText={(text) => setNewStudent({...newStudent, address: text})}
                                        />

                                        <Text style={styles.inputLabel}>Password</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter password"
                                            secureTextEntry
                                            value={newStudent.password}
                                            onChangeText={(text) => setNewStudent({...newStudent, password: text})}
                                        />

                                        <Text style={styles.inputLabel}>Fingerprint Data</Text>
                                        <TouchableOpacity style={styles.biometricButton} onPress={scanFingerprint}>
                                            <Ionicons name="finger-print-outline" size={24} color="#4A6FA5" />
                                            <Text style={styles.biometricButtonText}>Scan Fingerprint</Text>
                                        </TouchableOpacity>

                                        <Text style={styles.inputLabel}>Face Data</Text>
                                        <TouchableOpacity style={styles.biometricButton} onPress={captureFaceData}>
                                            <Ionicons name="camera-outline" size={24} color="#4A6FA5" />
                                            <Text style={styles.biometricButtonText}>Capture Face Data</Text>
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
                                                onPress={addStudent}
                                            >
                                                <Text style={styles.saveButtonText}>Save Student</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </ScrollView>
                                </View>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
    progressBar:{
        height:6,
        backgroundColor:'#E0E0E0',
        borderRadius:3,
        marginVertical:8,
        overflow:'hidden',
    },
    progressFill:{
        height:'100%',
        backgroundColor:'#4A6FA5',
        borderRadius:3,
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
    activityItem:{
        flexDirection:'row',
        marginBottom:16,
    },
    activityIcon:{
        width:36,
        height:36,
        borderRadius:18,
        backgroundColor:'#4A6FA5',
        justifyContent:'center',
        alignItems:'center',
        marginRight:12,
    },
    activityContent:{
        flex:1
    },
    activityTitle:{
        fontSize:16,
        color:'#333',
        marginBottom:5,
        fontFamily:'Montserrat_600SemiBold'
    },
    activityDetail:{
        fontSize:14,
        color:'#666',
        fontFamily:'Montserrat_400Regular',
        marginBottom:2,
    },
    activityTime:{
        fontSize:12,
        color:'#888',
        fontFamily:'Montserrat_400Regular',
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