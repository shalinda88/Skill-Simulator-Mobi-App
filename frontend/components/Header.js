import React from 'react';
import {Image, Text, View,StyleSheet} from "react-native";
import {userProfile} from "../mockData";

const Header =  () => {
    return(
        <View style={styles.header}>
            <Text style={styles.appName}>Skill Quest</Text>
            <Image
                source={require('../assets/user.jpg')} // Ensure the correct path
                style={styles.avatar}

                accessibilityLabel={`Sample's avatar`}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop:5,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    appName: {
        width:'85%',
        color: 'black',
        fontSize: 42,
        fontFamily: 'Ephesis_400Regular',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
})

export default Header;