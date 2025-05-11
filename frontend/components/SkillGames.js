import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import LottieView from 'lottie-react-native';
import { LOTTIE_ICONS } from '../constants/LottieIcons';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SkillGames = ({ onModulePress }) => {
  const navigation = useNavigation();
  const [skillGames, setSkillGames] = useState({
    roadCrossingGame: 0,
    publicTransportGame: 0,
    shoppingGame: 0
  });

  // Function to determine progress color and text
  const getProgressColor = (progress) => {
    if(progress < 25){
      return {
        color: '#FF6B6B', 
        label: 'Beginner'
      };
    } else if (progress >= 25 && progress < 50){
      return {
        color: '#FFA726',
        label: 'Developing',
      }
    } else if (progress >= 50 && progress < 75){
      return {
        color: '#4CAF50',
        label: 'Intermediate',
      }
    } else {
      return {
        color: '#2196F3', // Blue for advanced skills
        label: 'Advanced'
      }
    }
  }

  // Function to update game progress
  const updateGameProgress = async (gameType, progressValue) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.put(
        `https://skill-share-281536e63f1e.herokuapp.com/api/progress/game-progress/${gameType}`, 
        { progressValue },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      if (response.data.success) {
        fetchSkillGamesProgress();
      }
    } catch(error) {
      console.error('Error updating game progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  // Handle game restart
  const handleGameRestart = (gameName, gameType) => {
    Alert.alert(
      'Restart Game',
      `Do you want to restart the ${gameName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Restart',
          onPress: () => updateGameProgress(gameType, 0)

        }
      ]
    );
  };

  useEffect(() => {
    fetchSkillGamesProgress();
  }, []);

  const fetchSkillGamesProgress = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`https://skill-share-281536e63f1e.herokuapp.com/api/progress/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Set the skill games progress
      setSkillGames(response.data.skillGames);
    } catch(error) {
      console.error('Error fetching skill games progress:', error);
    }
  };

  const modules = [
    {
      name: "Crossing Streets Game",
      lottieIcon: LOTTIE_ICONS.streetCrossing,
      progressKey: "roadCrossingGame",
      accessibilityLabel: "Street Crossing Skill Game",
      route: "StreetCrossingGame",
      gameType: "road-crossing-game"
    },
    {
      name: "Shopping Game",
      lottieIcon: LOTTIE_ICONS.shopping,
      progressKey: "shoppingGame",
      accessibilityLabel: "Shopping Skill Game",
      route: "ShoppingGame",
      gameType: "shopping-game"
    },
    {
      name: "Public Transport Game",
      lottieIcon: LOTTIE_ICONS.transport,
      progressKey: "publicTransportGame",
      accessibilityLabel: "Public Transport Skill Game",
      route: "PublicTransportGame",
      gameType: "public-transport-game"
    }
  ];

  return (
    <View style={styles.modulesContainer}>
      {modules.map((module, index) => {
        const moduleProgress = skillGames[module.progressKey] || 0;
        const progressColor = getProgressColor(moduleProgress);

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.moduleCard, 
              moduleProgress === 100 && styles.completedModule
            ]}
            accessibilityLabel={module.accessibilityLabel}
            accessibilityHint="Double tap to start this skill game"
            onPress={() => {
              if (moduleProgress === 100) {
                handleGameRestart(module.name, module.gameType);
              } else {
                onModulePress(module.route);
              }
            }}
          >
            <View style={styles.moduleIconContainer}>
              <LottieView
                source={module.lottieIcon}
                autoPlay
                loop
                style={styles.moduleLottieIcon}
              />
            </View>
            <View style={styles.moduleDetails}>
              <Text style={styles.moduleName}>{module.name}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${moduleProgress}%`,
                      backgroundColor: progressColor.color
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {moduleProgress}% {progressColor.label}
              </Text>
              {moduleProgress === 100 && (
                <Text style={styles.completedText}>Game Mastered! Tap to Restart</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
    modulesContainer: {
        paddingTop: 10,
        backgroundColor: '#FFFFFF',
    },
    moduleCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    moduleIconContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        backgroundColor: '#F0F0F0',
        borderRadius: 15,
    },
    moduleLottieIcon: {
        width: 60,
        height: 60,
    },
    moduleDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    moduleName: {
        fontSize: 18,
        fontFamily:'Montserrat_500Medium',
        color: '#333',
        marginBottom: 8,
    },
    progressBar: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 5,
        width: '100%',
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
        transition: 'width 0.5s ease',
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'right',
        fontFamily:'Montserrat_400Regular',
    },
    // Accessibility and interaction states
    moduleCardPressed: {
        opacity: 0.7,
    },
});

export default SkillGames;