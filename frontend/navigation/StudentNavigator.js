import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Book, BarChart2, Settings, Bot,Gamepad } from 'lucide-react-native';
import DashboardScreen from "../screens/Student/DashboardScreen";
import Layout from "../layout/Layout";
import ProfileScreen from "../screens/Student/ProfileScreen";
import SkillGamesScreen from "../screens/Student/SkillGamesScreen";
import SkillModuleNavigator from "./SkillModuleNavigator";
import ConversationBot from "../screens/ConversationBot/ConversationBot";
import SkillGameNavigator from "./SkillGameNavigator"; // Import Layout

const SettingsScreen = () => (
    <View style={styles.center}>
        <Text style={styles.text}>Settings</Text>
    </View>
);

const BottomTabNavigator = createBottomTabNavigator();

const StudentNavigator = () => {
    return (
        <Layout>
            <BottomTabNavigator.Navigator
                initialRouteName="Dashboard"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let IconComponent;

                        if (route.name === 'Dashboard') {
                            IconComponent = Home;
                        } else if (route.name === 'Skill Modules') {
                            IconComponent = Book;
                        } else if (route.name === 'Skill Bot') {
                            IconComponent = Bot;
                        } else if (route.name === 'Skill Games') {
                            IconComponent = Gamepad;
                        } else if (route.name === 'Settings') {
                            IconComponent = Settings;
                        }
                        return <IconComponent color={color} size={size} />;
                    },
                    tabBarActiveTintColor: '#2e86de',
                    tabBarInactiveTintColor: 'gray',
                    headerShown: false,
                })}
            >
                <BottomTabNavigator.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                />
                <BottomTabNavigator.Screen
                    name="Skill Modules"
                    component={SkillModuleNavigator}
                    listeners={({ navigation, route }) => ({
                        tabPress: (e) => {
                            // Prevent default navigation
                            e.preventDefault();

                            // Always navigate to SkillModuleMain, regardless of current state
                            navigation.navigate('Skill Modules', {
                                screen: 'SkillModuleMain'
                            });
                        }
                    })}
                />
                <BottomTabNavigator.Screen
                    name='Skill Games'
                    component={SkillGameNavigator}
                    listeners={({ navigation, route }) => ({
                        tabPress: (e) => {
                            // Prevent default navigation
                            e.preventDefault();

                            // Always navigate to SkillModuleMain, regardless of current state
                            navigation.navigate('Skill Games', {
                                screen: 'SkillGameMain'
                            });
                        }
                    })}

                />
                <BottomTabNavigator.Screen name="Skill Bot" component={ConversationBot}/>
                <BottomTabNavigator.Screen name="Settings" component={ProfileScreen} />
            </BottomTabNavigator.Navigator>
        </Layout>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        fontFamily: 'Montserrat_500Medium',
    },
});

export default StudentNavigator;
