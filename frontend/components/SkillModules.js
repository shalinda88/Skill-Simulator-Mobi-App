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

const SkillModules = ({onModulePress}) => {
  const navigation = useNavigation();
  const [userProgress, setUserProgress] = useState({
    progress: {
      roadCrossing: 0,
      publicTransport: 0,
      shopping: 0
    },
    skillGames: {
      roadCrossingGame: 0,
      publicTransportGame: 0,
      shoppingGame: 0
    }
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

  // Function to update module progress
  const updateModuleProgress = async (moduleType, progressValue) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.put(
        `https://skill-share-281536e63f1e.herokuapp.com/api/progress/module-progress/${moduleType}`, 
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
        fetchStudentProgress();
      }
    } catch(error) {
      console.error('Error updating module progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  // Handle module restart
  const handleModuleRestart = (moduleName, moduleType) => {
    Alert.alert(
      'Restart Module',
      `Do you want to restart the ${moduleName} module?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Restart',
          onPress: () => updateModuleProgress(moduleType, 0)
        }
      ]
    );
  };

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  const fetchStudentProgress = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`https://skill-share-281536e63f1e.herokuapp.com/api/progress/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Set the entire progress object
      setUserProgress(response.data);
    } catch(error) {
      console.error('Error fetching student progress:', error);
    }
  };

  const modules = [
    {
      name: "Crossing Streets",
      lottieIcon: LOTTIE_ICONS.streetCrossing,
      accessibilityLabel: "Street Crossing Skill Module",
      route: "StreetCrossingModule",
      progressKey: "roadCrossing",
      gameProgressKey: "roadCrossingGame",
      moduleType: "road-crossing"
    },
    {
      name: "Shopping",
      lottieIcon: LOTTIE_ICONS.shopping,
      accessibilityLabel: "Shopping Skill Module",
      route: "ShoppingModule",
      progressKey: "shopping",
      gameProgressKey: "shoppingGame",
      moduleType: "shopping"
    },
    {
      name: "Public Transport",
      lottieIcon: LOTTIE_ICONS.transport,
      accessibilityLabel: "Public Transport Skill Module",
      route: "PublicTransportModule",
      progressKey: "publicTransport",
      gameProgressKey: "publicTransportGame",
      moduleType: "public-transport"
    }
  ];

  return (
    <View style={styles.modulesContainer}>
      {modules.map((module, index) => {
        const moduleProgress = userProgress.progress[module.progressKey] || 0;
        const gameProgress = userProgress.skillGames[module.gameProgressKey] || 0;
        const isModuleCompleted = moduleProgress === 100 && gameProgress === 100;
        const progressColor = getProgressColor(moduleProgress);

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.moduleCard, 
              isModuleCompleted && styles.completedModule
            ]}
            accessibilityLabel={module.accessibilityLabel}
            accessibilityHint="Double tap to start this skill module"
            onPress={() => {
              if (isModuleCompleted) {
                handleModuleRestart(module.name, module.moduleType);
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
              <View style={styles.progressContainer}>
                <View style={styles.progressSection}>
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
                </View>
              </View>
              {isModuleCompleted && (
                <Text style={styles.completedText}>Module Mastered! Tap to Restart</Text>
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

export default SkillModules;