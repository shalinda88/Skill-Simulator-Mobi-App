import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppLoading from "expo-app-loading";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
  Montserrat_500Medium,
  Montserrat_600SemiBold
} from "@expo-google-fonts/montserrat";
import { Ephesis_400Regular } from "@expo-google-fonts/ephesis";
import AuthNavigator from "./navigation/AuthNavigator";
import HomeScreen from "./screens/HomeScreen";
import AboutUsScreen from "./screens/AboutUsScreen";
import StudentNavigator from "./navigation/StudentNavigator";
import GuardianNavigator from "./navigation/GuardianNavigator";

// Create a Stack Navigator
const RootStack = createStackNavigator();

function MainApp() {
  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Ephesis_400Regular,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <RootStack.Screen name="Home" component={HomeScreen} />
        <RootStack.Screen name="About" component={AboutUsScreen} />
        <RootStack.Screen name='Auth' component={AuthNavigator}/>
        <RootStack.Screen name="Student" component={StudentNavigator}/>
        <RootStack.Screen name="Guardian" component={GuardianNavigator}/>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return <MainApp />;
}