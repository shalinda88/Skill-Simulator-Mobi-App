import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

// Create a Stack Navigator
const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false, // Hide default header
                    cardStyle: { backgroundColor: 'white' }
                }}
             >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                />
                <Stack.Screen
                    name="Signup"
                    component={SignupScreen}
                />
            </Stack.Navigator>
    );
};

export default AuthNavigator;