import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Type } from 'lucide-react-native'; // Correctly import the icon
import { COLORS } from '../constants/Color';

const ROLES = [
    { label: 'Parent', value: 'parent' },
    { label: 'Teacher', value: 'teacher' }
];

const RoleSelector = ({ selectedRole, onRoleSelect }) => {
    return (
        <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
                <Type color={COLORS.PRIMARY} size={24} />
            </View>
            <View style={styles.pickerContainer}>
                {ROLES.map((roleOption) => (
                    <TouchableOpacity
                        key={roleOption.value}
                        style={[
                            styles.roleButton,
                            selectedRole === roleOption.value && styles.selectedRole
                        ]}
                        onPress={() => onRoleSelect(roleOption.value)}
                        accessibilityLabel={`Select ${roleOption.label} role`}
                    >
                        <Text
                            style={[
                                styles.roleButtonText,
                                selectedRole === roleOption.value && styles.selectedRoleText
                            ]}
                        >
                            {roleOption.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        height: 50,
    },
    iconContainer: {
        marginRight: 10,
    },
    pickerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        backgroundColor: '#F0F4F8',
    },
    selectedRole: {
        backgroundColor: COLORS.ACCENT,
    },
    roleButtonText: {
        textAlign: 'center',
        color: COLORS.SECONDARY,
        fontFamily: 'Montserrat_400Regular', // Update to the desired font
        fontSize: 14, // Optional: Adjust font size for better readability
    },
    selectedRoleText: {
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Montserrat_400Regular' // Apply bold font for selected labels
    },
});

export default RoleSelector;
