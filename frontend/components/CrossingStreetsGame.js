import  React, {useEffect,useState}from 'react';
import {View,Text,StyleSheet,TouchableOpacity,SafeAreaView,Alert} from 'react-native';
import {Audio} from 'expo-av';
import LottieView from "lottie-react-native";

const CrossingStreetsGame = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [soundObject, setSoundObject] = useState(null);
    const [score,setScore] = useState(0);
    const [backgroundSound, setBackgroundSound] = useState(null);


    const NarrationSound = [
        {text: "Look left and right for traffic.", file}
    ]
}