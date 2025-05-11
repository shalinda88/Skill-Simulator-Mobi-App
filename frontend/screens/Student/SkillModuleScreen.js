import React, {useState,useEffect} from 'react';
import {Text, View, StyleSheet, SafeAreaView, ScrollView} from "react-native";
import SkillModules from "../../components/SkillModules";
import SkillGames from "../../components/SkillGames";
import AsyncStorage from '@react-native-async-storage/async-storage';


const SkillModuleScreen = ({navigation}) => {
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    setUserToken(token);
                }
            } catch (error) {
                console.error('Error retrieving token:', error);
            }
        };

        fetchToken();
    }, []);

    return(
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                accessibilityLabel="Dashboard scroll view"
            >
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Your Skill Modules</Text>
                    <SkillModules
                        onModulePress={(route) =>
                            navigation.navigate(route, {token: userToken})
                        }
                    />
                </View>

                <View style={styles.moreContainer}>
                    <Text style={styles.moreText}>More Skill Modules Will Be Added</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily:'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 10,
    },
    sectionContainer: {
        paddingVertical: 2,
        paddingHorizontal: 15,
    },
    moreContainer: {
        marginTop:10,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#ADD8E6',
        borderWidth: 2,
        borderColor: '#87CEEB',
        borderRadius: 10,
        width: '80%',
        alignSelf: 'center',
    },
    moreText: {
        fontSize: 15,
        fontWeight: '400',
        fontFamily: 'Montserrat_400Regular',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    }
})

export default SkillModuleScreen;