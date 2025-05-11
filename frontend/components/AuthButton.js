import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { COLORS } from '../constants/Color';

const AuthButton = ({
                        title,
                        onPress,
                        accessibilityLabel
                    }) => (
    <TouchableOpacity
        style={styles.authButton}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
    >
        <Text style={styles.authButtonText}>{title}</Text>
        <View style={styles.iconWrapper}>
            <ArrowRight color="white" size={24} />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    authButton: {
        backgroundColor: COLORS.ACCENT,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        position: 'relative',
    },
    authButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Montserrat_700Bold',
    },
    iconWrapper: {
        position: 'absolute',
        right: 20,
    },
});

export default AuthButton;
