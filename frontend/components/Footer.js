import React from 'react';
import {Text, View,StyleSheet} from "react-native";

const Footer = () => {
    return(
        <View style={styles.accessibilityNoteContainer}>
            <Text style={styles.accessibilityNote}>
                Designed with care for visually impaired learners
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    accessibilityNoteContainer: {
        marginTop: 10,
        paddingVertical: 15,
        backgroundColor: '#F0F0F0',
    },
    accessibilityNote: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
        fontFamily:"Montserrat_400Regular",
    },
})

export default Footer;