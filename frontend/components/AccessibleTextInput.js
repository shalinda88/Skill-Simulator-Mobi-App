import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Color';

const AccessibleTextInput = ({
                                 icon: Icon,
                                 placeholder,
                                 secureTextEntry = false,
                                 accessibilityLabel,
                                 value,
                                 onChangeText,
                                 style
                             }) => (
    <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>
            <Icon color={COLORS.PRIMARY} size={24} />
        </View>
        <TextInput
            style={[styles.input, style]}
            placeholder={placeholder}
            placeholderTextColor={COLORS.SECONDARY}
            secureTextEntry={secureTextEntry}
            accessibilityLabel={accessibilityLabel}
            value={value}
            onChangeText={onChangeText}
            accessibilityHint={`Enter your ${placeholder.toLowerCase()}`}
        />
    </View>
);

const styles = StyleSheet.create({
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
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular'
    }
});

export default AccessibleTextInput;