import React, {useState,useEffect} from 'react';
import {Text, View, StyleSheet, SafeAreaView, ScrollView} from "react-native";
import SkillModules from "../../components/SkillModules";
import SkillGames from "../../components/SkillGames";
import AsyncStorage from '@react-native-async-storage/async-storage';


const SkillGameScreen = ({navigation}) => {

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
                    <Text style = {styles.sectionTitle}>Skill Games</Text>
                    <SkillGames
                        onModulePress={(route) =>
                            navigation.navigate(route,{token:userToken})
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
        backgroundColor: '#ADD8E6', // Light blue background
        borderWidth: 2, // Border thickness
        borderColor: '#87CEEB', // Lighter blue border
        borderRadius: 10, // Rounded corners
        width: '80%', // Control width
        alignSelf: 'center', // Center the container itself
    },

    moreText: {
        fontSize: 15,
        fontWeight: '400', // 'regular' is not a valid value, use numeric weight
        fontFamily: 'Montserrat_400Regular',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center', // Ensures text is centered
    }
})


export default SkillGameScreen;