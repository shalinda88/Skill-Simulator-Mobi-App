import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get("window");

export const AchievementBadge = () => {
  const [completedModules, setCompletedModules] = useState([]);

  // Achievement mapping for different modules
  const achievementIcons = {
    'Road Crossing Mastered': 'directions-walk',
    'Shopping Mastered': 'shopping-cart',
    'Public Transport Mastered': 'directions-bus'
  };

  const achievementDescriptions = {
    'Road Crossing Mastered': 'You\'ve mastered safe street crossing techniques!',
    'Shopping Mastered': 'You\'ve become a confident shopper!',
    'Public Transport Mastered': 'You\'ve learned to navigate public transport like a pro!'
  };

  useEffect(() => {
    fetchCompletedModules();
  }, []);

  const fetchCompletedModules = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(`https://skill-share-281536e63f1e.herokuapp.com/api/progress/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Calculate completed modules
      const completed = [];
      const data = response.data;

      // Check each module's progress
      if (data.progress.roadCrossing === 100 && data.skillGames.roadCrossingGame === 100) {
        completed.push('Road Crossing Mastered');
      }
      if (data.progress.shopping === 100 && data.skillGames.shoppingGame === 100) {
        completed.push('Shopping Mastered');
      }
      if (data.progress.publicTransport === 100 && data.skillGames.publicTransportGame === 100) {
        completed.push('Public Transport Mastered');
      }

      setCompletedModules(completed);
    } catch (error) {
      console.error('Error fetching completed modules:', error);
    }
  };

  // Individual Badge Component with Animation
  const AnimatedBadge = ({ title }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    }, [scaleAnim, opacityAnim]);

    return (
      <Animated.View
        style={[
          styles.achievementBadge,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <MaterialIcons 
          name={achievementIcons[title]} 
          size={40} 
          color="#005A9C" 
        />
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>{title}</Text>
          <Text style={styles.achievementDescription}>
            {achievementDescriptions[title]}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // If no completed modules
  if (completedModules.length === 0) {
    return (
      <View style={styles.noAchievementsContainer}>
        <MaterialIcons 
          name="stars" 
          size={50} 
          color="#888" 
        />
        <Text style={styles.noAchievementsText}>
          Complete modules to unlock achievements!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.achievementsContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>Your Achievements</Text>
      {completedModules.map((module, index) => (
        <AnimatedBadge 
          key={index} 
          title={module} 
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    achievementBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    achievementContent: {
        marginLeft: 15,
        flex: 1,
    },
    achievementTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        fontFamily:'Montserrat_500Medium'
    },
    achievementDescription: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
        fontFamily:'Montserrat_400Regular',
    },
    noAchievementsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      noAchievementsText: {
        marginTop: 15,
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
      },
});
