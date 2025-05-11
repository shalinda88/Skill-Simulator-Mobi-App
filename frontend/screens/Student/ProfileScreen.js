import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView, TouchableOpacity, Alert
} from 'react-native';
import {useNavigation} from "@react-navigation/native";
import { userProfile } from '../../mockData';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';


const ProfileScreen = () => {
    const navigation = useNavigation();
    const [user,setUser] = useState([]);
    const [userProgress,setUserProgress] = useState({});
    const [isLoading,setIsLoading] = useState(true);
    const [overallProgress, setOverallProgress] = useState(0);
    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const userData = await AsyncStorage.getItem('userData');
            const token = await AsyncStorage.getItem('userToken');
            if (userData) {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);

                const response = await axios.get(`https://skill-share-281536e63f1e.herokuapp.com/api/progress/${parsedUser.id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                setUserProgress(response.data);
                const calculatedOverallProgress = calculateOverallProgress(response.data);
                setOverallProgress(calculatedOverallProgress);
                console.log(userProgress);
            }
            setIsLoading(false);
          } catch (error) {
            console.error('Error fetching student information', error);
            Alert.alert('Error', 'Failed to fetch student information');
            setIsLoading(false);
          }
        };
        
        fetchUserData();
      }, []); 
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

    const calculateOverallProgress = (userProgress) => {
        // Check if userProgress exists and has necessary properties
        if (!userProgress || !userProgress.progress || !userProgress.skillGames) {
            return 0;
        }
    
        // Define the skills and their corresponding game keys
        const skillModules = [
            { 
                skillKey: 'roadCrossing', 
                gameKey: 'roadCrossingGame' 
            },
            { 
                skillKey: 'publicTransport', 
                gameKey: 'publicTransportGame' 
            },
            { 
                skillKey: 'shopping', 
                gameKey: 'shoppingGame' 
            }
        ];
    
        // Calculate total progress
        let totalProgress = 0;
        let moduleCount = 0;
    
        skillModules.forEach(({ skillKey, gameKey }) => {
            // Get progress for skill module and skill game
            const skillProgress = userProgress.progress[skillKey] || 0;
            const gameProgress = userProgress.skillGames[gameKey] || 0;
    
            // Calculate average progress for this module
            const moduleProgress = (skillProgress + gameProgress) / 2;
            
            totalProgress += moduleProgress;
            moduleCount++;
        });
    
        // Calculate overall progress
        const overallProgress = moduleCount > 0 
            ? Math.round(totalProgress / moduleCount)
            : 0;
    
        return overallProgress;
    };

    // Method for calculate the full completed module
    function calculateCompleteModules (data){
        let completedModules = 0;
        for(let key in data.progress){
            let gameKey = key + "Game";

            if (data.progress[key] === 100 && data.skillGames[gameKey] === 100) {
                completedModules++;
            }
        }
        return completedModules;
    }

    // Method to calculate completed modules
    const calculateAchievmentModules = (data) => {
        let completedModules = [];
        for(let key in data.progress){
            let gameKey = key + "Game";
            if (data.progress[key] === 100 && data.skillGames[gameKey] === 100){
                completedModules.push(`${key.charAt(0).toUpperCase() + key.slice(1)} Mastered`);
            }
        }
        return completedModules;
    }

    const masteredModules = calculateAchievmentModules(userProgress);

    // Function to determine progress color and text
    const getProgressColor = (progress) => {
        if(progress < 25){
            return {
                color: '#FF6B6B', 
                label: 'Beginner'
            };
        }else if (progress >= 25 && progress < 50){
            return {
                color: '#FFA726',
                label: 'Developing',
            }
        }else if (progress >= 50 && progress < 75){
            return{
                color: '#4CAF50',
                label: 'Intermediate',
            }
        }else{
            return{
                color: '#2196F3', // Blue for advanced skills
                label: 'Advanced'
            }
        }
    }

    const skills = [
        { 
          name: 'Public Transport', 
          progress: userProgress?.progress?.publicTransport || 0
        },
        { 
          name: 'Road Crossing', 
          progress: userProgress?.progress?.roadCrossing || 0
        },
        { 
          name: 'Shopping', 
          progress: userProgress?.progress?.shopping || 0
        }
    ];
    
    const skillGames = [
        { 
          name: 'Public Transport Game', 
          progress: userProgress?.skillGames?.publicTransportGame || 0
        },
        { 
          name: 'Road Crossing Game', 
          progress: userProgress?.skillGames?.roadCrossingGame || 0
        },
        { 
          name: 'Shopping Game', 
          progress: userProgress?.skillGames?.shoppingGame || 0
        }
    ];



    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileHeader}>
                <Image
                    source={require('../../assets/user.jpg')} // Ensure the correct path
                    style={styles.avatar}
                    accessibilityLabel={`${userProfile.name}'s avatar`}
                />
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                        {overallProgress || 0}%
                    </Text>
                    <Text style={styles.statLabel}>Overall Progress</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{calculateCompleteModules(userProgress)}</Text>
                    <Text style={styles.statLabel}>Completed Modules</Text>
                </View>
            </View>
            <View style={styles.achievementsContainer}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                {masteredModules.length > 0 ? (
                    masteredModules.map((module, index) => (
                    <View key={index} style={styles.achievementItem}>
                        <Text style={styles.achievementName}>{module}</Text>
                        <Text style={styles.achievementDate}>{new Date().toLocaleDateString()}</Text>
                    </View>
                    ))
                ) : (
                    <View style={styles.achievementItem}>
                        <Text style={styles.achievementName}>No modules mastered yet</Text>
                    </View>
                )}
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Skill Progress</Text>
                {skills.map((skill, index) => {
                    const progressInfo = getProgressColor(skill.progress);
                    
                    return (
                    <View key={index} style={styles.skillProgressCard}>
                        <View style={styles.skillHeaderContainer}>
                        <Text style={styles.skillName}>{skill.name}</Text>
                        <Text style={[styles.progressLabel, { color: progressInfo.color }]}>
                            {progressInfo.label}
                        </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                        <View
                            style={[
                            styles.progressBar,
                            {
                                width: `${skill.progress}%`,
                                backgroundColor: progressInfo.color
                            }
                            ]}
                        />
                        </View>
                        <Text style={styles.progressText}>{skill.progress}% Complete</Text>
                    </View>
                    );
                })}
            </View>
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Skill Games Progress</Text>
                {skillGames.map((game, index) => {
                    const progressInfo = getProgressColor(game.progress);
                    
                    return (
                    <View key={index} style={styles.skillProgressCard}>
                        <View style={styles.skillHeaderContainer}>
                        <Text style={styles.skillName}>{game.name}</Text>
                        <Text style={[styles.progressLabel, { color: progressInfo.color }]}>
                            {progressInfo.label}
                        </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                        <View
                            style={[
                            styles.progressBar,
                            {
                                width: `${game.progress}%`,
                                backgroundColor: progressInfo.color
                            }
                            ]}
                        />
                        </View>
                        <Text style={styles.progressText}>{game.progress}% Complete</Text>
                    </View>
                    );
                })}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={()=> handleSignOut()}>
                    <Text style={[styles.buttonText, styles.signOutText]}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    profileHeader: {
        alignItems: 'center',
        padding: 20,
        
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
        fontFamily:'Montserrat_700Bold',
    },
    userEmail: {
        fontSize: 16,
        color: 'black',
        fontFamily:'Montserrat_400Regular'
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: 'white'
    },
    statBox: {
        alignItems: 'center'
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        fontFamily:"Montserrat_700Bold",
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily:'Montserrat_500Medium',
    },
    achievementsContainer: {
        padding: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily:'Montserrat_700Bold',
    },
    achievementItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 2,
        marginVertical: 1,
        borderRadius: 10,
        marginTop:10,
        paddingVertical: 20,
        alignItems: 'center',
        paddingHorizontal: 5,
        borderWidth: 2, // Border thickness
        borderColor: '#87CEEB', // Lighter blue border
        width: '100%', // Control width
        alignSelf: 'center', //
    },
    achievementName: {
        fontFamily:'Montserrat_600SemiBold',
        fontSize: 16
    },
    achievementDate: {
        fontFamily:'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#666'
    },
    sectionContainer: {
        paddingVertical: 2,
        paddingHorizontal: 15,
    },
    skillProgressCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    skillName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily:'Montserrat_400Regular',
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 5
    },
    progressBar: {
        height: '100%'
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'right',

    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    detailText: {
        fontSize: 12,
        fontFamily:'Montserrat_400Regular',
        color: '#999'
    },
    lastPractice:{
        fontFamily:'Montserrat_400Regular',
    },
    buttonContainer:{
        flexDirection: "row",
        justifyContent: "center",
        padding: 30,
    },
    button: {
        backgroundColor: "#007BFF",
        paddingVertical: 20,  // Increased vertical padding
        paddingHorizontal: 40, // Increased horizontal padding
        borderRadius: 8,
        width: 300,  // Set a fixed width
        height: 60,  // Set a fixed height
        alignItems: "center",  // Centers text inside the button
        justifyContent: "center", // Centers text vertically
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        fontFamily:'Montserrat_700Bold'
    },
    signOutButton: {
        backgroundColor: "#DC3545",
    },
    signOutText: {
        color: "white",
    },

});

export default ProfileScreen;