import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Alert
} from 'react-native';
import { Mail, Lock, Fingerprint, FaceId, UserCheck } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Speech from 'expo-speech'; // For accessibility features

import { COLORS } from '../../constants/Color';
import AccessibleTextInput from '../../components/AccessibleTextInput';
import AuthButton from '../../components/AuthButton';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Accessibility speech feedback
    const provideSpeechFeedback = (message) => {
        Speech.speak(message, {
            language: 'en-US',
            pitch: 1,
            rate: 0.8
        });
    };

    // Common login handling function
    const handleLoginSuccess = async (response) => {
        // Store user data and token
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
        await AsyncStorage.setItem('userToken', response.data.data.token);

        // Provide audio feedback for successful login
        provideSpeechFeedback('Login successful. Navigating to dashboard.');

        switch(response.data.data.user.role) {
            case 'student':
                navigation.navigate('Student', { screen: 'Dashboard' });
                break;
            case 'parent':
                navigation.navigate('Guardian', { screen: 'Dashboard' });
                break;
            case 'teacher':
                navigation.navigate('Guardian', { screen: 'Dashboard' });
                break;
            default:
                Alert.alert('Login Success', 'Logged in successfully!');
        }
    };

    // Standard Email/Password Login
    const handleLogin = async () => {
        // Basic Validation
        if (!email || !password){
            provideSpeechFeedback('Please enter both email and password');
            Alert.alert('Error','Please enter both email and password');
            return;
        }
        setIsLoading(true);

        try {
            // Make API call to backend login endpoint
            const response = await axios.post('https://skill-share-281536e63f1e.herokuapp.com/api/users/login', {
                email,
                password
            });

            await handleLoginSuccess(response);
        } catch (error) {
            console.error('Login Error:', error.response ? error.response.data : error);
            
            // Provide speech feedback for login error
            provideSpeechFeedback('Login failed. Please check your credentials.');
            
            Alert.alert(
                'Login Failed',
                error.response?.data?.message || 'An error occurred during login'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Universal Biometric Login
    const handleUniversalBiometricLogin = async () => {
        // Check if device supports biometric authentication
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            provideSpeechFeedback('Biometric authentication not available');
            Alert.alert('Error', 'Biometric authentication not available');
            return;
        }

        try {
            // Provide audio guidance before authentication
            provideSpeechFeedback('Prepare for biometric authentication. Please follow the on-screen prompts.');

            // Authenticate user with biometrics
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to login',
                fallbackLabel: 'Use alternative method',
                // Customize for accessibility
                disableDeviceFallback: false
            });

            if (result.success) {
                // Prompt for user identifier (email or student ID)
                const userIdentifier = await new Promise((resolve) => {
                    Alert.prompt(
                        'Confirm Identity',
                        'Please enter your email or student ID',
                        [
                            {
                                text: 'Cancel',
                                onPress: () => resolve(null),
                                style: 'cancel'
                            },
                            {
                                text: 'Confirm',
                                onPress: (identifier) => resolve(identifier)
                            }
                        ],
                        'plain-text',
                        '',
                        'email-address'
                    );
                });

                if (!userIdentifier) {
                    provideSpeechFeedback('Login cancelled');
                    return;
                }

                // Make API call for universal biometric login
                const response = await axios.post('https://skill-share-281536e63f1e.herokuapp.com/api/users/universal-biometric-login', {
                    userIdentifier,
                    biometricVerified: true
                });

                // Provide speech feedback for successful authentication
                provideSpeechFeedback('Biometric authentication successful');

                await handleLoginSuccess(response);
            } else {
                provideSpeechFeedback('Biometric authentication failed');
            }
        } catch (error) {
            console.error('Biometric Login Error:', error);
            
            // Provide speech feedback for authentication error
            provideSpeechFeedback('Biometric login failed. Please try again.');
            
            Alert.alert('Login Failed', 'Biometric authentication failed');
        }
    };

    const handleForgotPassword = () => {
        // Implement forgot password logic with accessibility
        provideSpeechFeedback('Password reset functionality coming soon');
        Alert.alert('Forgot Password', 'Password reset functionality coming soon');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>
                            Welcome to SkillQuest
                        </Text>
                        <Text style={styles.subtitle}>
                            Login to Continue Your Learning Journey
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <AccessibleTextInput
                            icon={Mail}
                            placeholder="Email"
                            accessibilityLabel="Email input"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <AccessibleTextInput
                            icon={Lock}
                            placeholder="Password"
                            secureTextEntry
                            accessibilityLabel="Password input"
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={handleForgotPassword}
                            accessibilityLabel="Forgot password"
                        >
                            <Text style={styles.forgotPasswordText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        <AuthButton
                            title={isLoading ? "Logging In..." : "Login"}
                            onPress={handleLogin}
                            accessibilityLabel="Login button"
                        />

                        {/* Inclusive Biometric Login Option */}
                        <View style={styles.biometricContainer}>
                            <TouchableOpacity 
                                style={styles.biometricButton}
                                onPress={handleUniversalBiometricLogin}
                                accessibilityLabel="Universal biometric login for accessibility"
                            >
                                <UserCheck color={COLORS.ACCENT} size={24} />
                                <Text style={styles.biometricButtonText}>Accessible Login</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>
                                Don't have an account?
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Signup')}
                                accessibilityLabel="Navigate to signup"
                            >
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    keyboardView: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20
    },
    headerContainer: {
        marginBottom: 30,
        alignItems: 'center'
    },
    title: {
        width:'100%',
        fontSize: 42,
        color: COLORS.TEXT,
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Ephesis_400Regular'
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.SECONDARY,
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular'
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 15

    },
    forgotPasswordText: {
        color: COLORS.ACCENT,
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular'
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    signupText: {
        color: COLORS.SECONDARY,
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular'
    },
    signupLink: {
        color: COLORS.ACCENT,
        fontWeight: 'bold',
        marginLeft: 5,
        fontFamily: 'Montserrat_400Regular',
    },
    biometricContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 15,
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.ACCENT,
        borderRadius: 10,
    },
    biometricButtonText: {
        marginLeft: 5,
        color: COLORS.ACCENT,
        fontFamily: 'Montserrat_400Regular',
    }
});

export default LoginScreen;