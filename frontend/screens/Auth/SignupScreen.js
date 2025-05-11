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
import { UserCircle, Mail, Lock } from 'lucide-react-native';

import { COLORS } from '../../constants/Color';
import AccessibleTextInput from '../../components/AccessibleTextInput';
import AuthButton from '../../components/AuthButton';
import RoleSelector from '../../components/RoleSelector';
import axios from "axios";


const SignupScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        if (!name) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return false;
        }
        if (!password || password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return false;
        }
        if (!role) {
            Alert.alert('Error', 'Please select a role');
            return false;
        }
        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;
    
        setIsLoading(true);
        try {
            const response = await axios.post('https://skill-share-281536e63f1e.herokuapp.com/api/users/register-adult', {
                fullName: name,
                email,
                password,
                role
            });
    
            if (response.data.success) {
                let message = 'Signup successful!';
    
                if (role === 'teacher') {
                    message = 'Teacher registered successfully. Please log in.';
                } else if (role === 'parent') {
                    message = 'Parent registered successfully. Please log in.';
                } else {
                    message = 'Signup successful. Please log in.';
                }
    
                Alert.alert('Success', message, [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login') // Navigate after alert confirmation
                    }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Signup Failed', error.response?.data?.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
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
                            Create Your Account
                        </Text>
                        <Text style={styles.subtitle}>
                            Join SkillQuest and Start Learning
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <AccessibleTextInput
                            icon={UserCircle}
                            placeholder="Full Name"
                            accessibilityLabel="Name input"
                            value={name}
                            onChangeText={setName}
                        />

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

                        <RoleSelector
                            selectedRole={role}
                            onRoleSelect={setRole}
                        />

                        <AuthButton
                            title={isLoading ? "Creating Account..." : "Sign Up"}
                            onPress={handleSignup}
                            accessibilityLabel="Signup button"
                        />

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>
                                Already have an account?
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login')}
                                accessibilityLabel="Navigate to login"
                            >
                                <Text style={styles.signupLink}>Login</Text>
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
        backgroundColor: COLORS.BACKGROUND
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        height: 50
    },
    iconContainer: {
        marginRight: 10
    },
    input: {
        flex: 1,
        color: COLORS.TEXT,
        fontSize: 16
    },
    authButton: {
        backgroundColor: COLORS.ACCENT,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginTop: 10
    },
    authButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 15
    },
    forgotPasswordText: {
        color: COLORS.ACCENT,
        fontSize: 14
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20
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
        fontFamily: 'Montserrat_400Regular'
    },
    pickerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        backgroundColor: '#F0F4F8'
    },
    selectedRole: {
        backgroundColor: COLORS.ACCENT
    },
    roleButtonText: {
        textAlign: 'center',
        color: COLORS.SECONDARY
    },
    selectedRoleText: {
        color: 'white',
        fontWeight: 'bold'
    }
});

export default SignupScreen;