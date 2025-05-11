import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert} from 'react-native'
import {COLORS} from "../../constants/Color";
import {Montserrat_600SemiBold} from "@expo-google-fonts/montserrat";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings(){

    const navigation = useNavigation();
    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('userData');
                            await AsyncStorage.removeItem('userToken');
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Auth' }]
                            });
                        } catch (error) {
                            console.error('Logout Error:', error);
                            Alert.alert('Error', 'An error occurred while logging out.');
                        }
                    }
                }
            ]
        );
    };
    return(
        <ScrollView style={styles.container}>
            <Text style={styles.pageTitle}>Settings</Text>

            <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Account</Text>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>Profile Information</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>Change Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>Notification Preferences</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Accessibility</Text>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>Text Size</Text>
                    <Text style={styles.settingsItemValue}>Large</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>High Contrast Mode</Text>
                    <Text style={styles.settingsItemValue}>On</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>Screen Reader Support</Text>
                    <Text style={styles.settingsItemValue}>Enhanced</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Data & Privacy</Text>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>Student Data Management</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>Privacy Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <Text style={styles.settingsItemLabel}>Export All Data</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingBottom: 70,
        backgroundColor: COLORS.BACKGROUND,
    },
    pageTitle: {
        fontSize: 21,
        fontWeight: '600',
        color: '#111',
        fontFamily: 'Montserrat_600SemiBold',
        marginBottom: 20,
    },
    settingsSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    settingsSectionTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 16,
    },
    settingsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    settingsItemLabel: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Montserrat_400Regular',
    },
    settingsItemValue: {
        fontSize: 14,
        color: '#4A6FA5',
        fontFamily: 'Montserrat_600SemiBold',
    },
    logoutButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    logoutButtonText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
    }
});