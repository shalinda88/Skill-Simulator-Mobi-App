import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech'
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { LOTTIE_ICONS } from '../../../constants/LottieIcons';
import axios from 'axios';

const ShoppingModule = ({navigation,route}) => {

    const [currentStep,setCurrentStep] = useState(-1);
    const [voiceNarrator,setVoiceNarrator] = useState('male');
    const [soundObject,setSoundObject] = useState(null)
    const [recognizing,setRecognizing] = useState(false)
    const [transcript,setTranscript] =useState("")
    const [lang,setLang] = useState('en');
    const [token,setToken] = useState(route.params?.token || '');

    const commands = {
        'start': ['start', 'begin', 'ආරම්භ කරන්න', 'ආරම්භ', 'தொடங்கு'],
        'stop': ['stop', 'end', 'නවතා', 'நிறுத்து', 'இறங்கு'],
        'nextStep': ['next step', 'next', 'ඊළඟ පියවර', 'அடுத்த படி'],
        'switchNarrator': ['switch narrator', 'change narrator', 'ස්වාධීන කථිකාචාර්ය', 'මාරු කරන්න','கதைப்பர் மாற்று']
    };

    useSpeechRecognitionEvent("start",()=>setRecognizing(true));
    useSpeechRecognitionEvent("end",() => setRecognizing(false));
    useSpeechRecognitionEvent('result',(event)=>{
        const result = event.results[0]?.transcript;
        setTranscript(result);

        // Check if the user command matches any of the nextStep commands
        const isNextStepCommand = commands.nextStep.some(cmd =>
            result.toLowerCase().includes(cmd.toLowerCase())
        );

        if (isNextStepCommand) {
            handleNextStepWithVoice();
        }
    });
    useSpeechRecognitionEvent('error',(event) =>{
        console.log('error code:',event.error,'error message:',event.message)
    })

    useEffect(()=>{
        const getAudioPermission = async() => {
            const {status} = await Audio.requestPermissionsAsync();
            if (status !== 'granted'){
                alert('Permission to access audio is required');
            }
        };
        getAudioPermission();

        // Start speech recognition as soon as the component mounts
        startContinuousSpeechRecognition();

        return () => {
            if (soundObject){
                soundObject.unloadAsync();
            }
            // Stop speech recognition when component unmounts
            ExpoSpeechRecognitionModule.stop();
        };
    },[])

    const updateProgressInBackend = async (progressValue) => {
        try {
            const response = await axios.put(
                'https://skill-share-281536e63f1e.herokuapp.com/api/progress/module-progress/shopping', 
                { progressValue },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                console.log('Progress updated successfully:', response.data.updatedProgress);
            }
        } catch (error) {
            console.error('Error updating progress:', error.response ? error.response.data : error.message);
        }
    };

    const steps = {
        en:[
            {
                title: 'Make a Shopping List',
                description: 'Plan what items you need to buy. Speak your items to create a list.',
            },
            {
                title: 'Navigate the Store',
                description: 'Use vocal commands to get information about different store sections.',
            },
            {
                title: 'Checkout Process',
                description: 'Follow guidance for payment options and bagging your items.',
            },
        ],
        si:[
            {
                title:'බඩු ලයිස්තුව සාදන්න',
                description:'ඔබට මිලදි ගැනිමට අවශය ද්‍රව්‍ය ලයිස්තු ගත කරන්න'
            },
            {
                title: 'සංස්ථානය පරික්ෂා කරන්න',
                description: 'විවිධ වෙළඳසැල් අංශයන් පිළිබඳ තොරතුරු ලබා ගැනීමට හඬ උපදෙස් භාවිතා කරන්න.',
            },
            {
                title: 'ගෙවීම් ක්‍රියාවලිය',
                description: 'ගෙවීම් විකල්ප හා භාණ්ඩ ඇසුරුම් කිරීම පිළිබඳ මාර්ගෝපදේශ අනුව ක්‍රියා කරන්න.',
            },
        ],
        ta: [
            {
                title: 'அலுவலக பட்டியலை உருவாக்கவும்',
                description: 'நீங்கள் வாங்கவேண்டிய பொருட்களை திட்டமிடுங்கள். பட்டியலை உருவாக்க பொருட்களை பேசுங்கள்.',
            },
            {
                title: 'அங்காடி வழிபோக்கவும்',
                description: 'வெவ்வேறு கடை பிரிவுகளுக்கு தகவல் பெற வாய்ப்பு வழங்குவதற்கான வார்த்தை கட்டளைகளை பயன்படுத்தவும்.',
            },
            {
                title: 'பணம் கொடுக்குமுறை',
                description: 'பணம் கொடுக்கும் விருப்பங்கள் மற்றும் பொருட்களை தொகுப்பதற்கான வழிகாட்டுதலினை பின்பற்றவும்.',
            },
        ],
    };

    // Function to start continuous speech recognition
    const startContinuousSpeechRecognition = async () => {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if(!result.granted){
            console.warn('Permission is not granted',result)
            return
        }

        ExpoSpeechRecognitionModule.start({
            lang: lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-IN' : 'en-US',
            interimResults:true,
            maxAlternatives:1,
            continuous:true,  // Set to true for continuous listening
            requiresOnDeviceRecognition:false,
            addsPunctuation:false,
            contextualStrings: Object.values(commands).flat()
        });
    };

    // Restart speech recognition when it ends
    useEffect(() => {
        if (!recognizing) {
            // Small delay to prevent immediate restart
            const timer = setTimeout(() => {
                startContinuousSpeechRecognition();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [recognizing]);

    // Play narration for the current step
    const playStepNarration = async (stepIndex)=> {
        try {
            // Unload the previous sound if any
            if (soundObject){
                await soundObject.unloadAsync()
                setSoundObject(null)
            }
            Speech.speak(steps[lang][stepIndex].description, { language: lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-IN' : 'en-US' });
        } catch (error) {
            console.error('Error playing the audio',error.message)
        }
    }

    // Stop the audio
    const stopAudio = async() => {
        if(soundObject){
            await soundObject.stopAsync();
        }
    };

    useEffect(() => {
        Speech.speak("You can say 'next' or 'next step' to proceed through the module",
            { language: lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-IN' : 'en-US' });
    }, []);


    const handleGetStarted = async () => {
        await updateProgressInBackend(0);
        // Now set the current step to 0 when the button is clicked
        setCurrentStep(0);
        // Optionally speak again to confirm the start of the module
        Speech.speak("Step 1: " + steps[lang][0].title, {
            language: lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-IN' : 'en-US',
        });
    };

    const handleNextStepWithVoice = async () => {
        if(currentStep < steps[lang].length - 1){
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);

            const progressPercentage = Math.round(((nextStep + 1) / steps[lang].length) * 100);
            await updateProgressInBackend(progressPercentage);

            await playStepNarration(nextStep);
        }else{
            await updateProgressInBackend(100);
            await stopAudio();
            Speech.speak("Module complete. Returning to main menu.",
                { language: lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-IN' : 'en-US' });
            setTimeout(() => navigation.goBack(), 3000);  // Give time for the message to be spoken
        }
    };

    const handleNextStep = async () => {
        if(currentStep < steps[lang].length - 1){
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);

            const progressPercentage = Math.round(((nextStep + 1) / steps[lang].length) * 100);
            await updateProgressInBackend(progressPercentage);
            await playStepNarration(nextStep); // Play narration when next button is pressed
        }else{
            await updateProgressInBackend(100);
            await stopAudio();
            Speech.speak("Module complete. Returning to main menu.",
                { language: lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-IN' : 'en-US' });
            setTimeout(() => navigation.goBack(), 3000);  // Give time for the message to be spoken
        }
    };

    const toggleNarrator = () => {
        setVoiceNarrator(voiceNarrator === 'male' ? 'female':'male')
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.moduleContent}>
                {currentStep === -1 ? (
                    <>
                        <LottieView
                            source={LOTTIE_ICONS.shopping}
                            autoPlay
                            loop
                            style={styles.moduleIcon}
                        />
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleGetStarted}
                            accessibilityLabel="Get Started"
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>
                        <View style={styles.moduleHeader}>
                            <TouchableOpacity
                                onPress={toggleNarrator}
                                accessibilityLabel={`Switch to ${voiceNarrator === 'male' ? 'female' : 'male'} narrator`}
                            >
                                <Text
                                    style={[
                                        styles.voiceToggle,
                                        { color: voiceNarrator === 'male' ? 'blue' : 'pink' }
                                    ]}
                                >
                                    {voiceNarrator === 'male' ? '♀ Switch to Female' : '♂ Switch to Male'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <LottieView
                            source={LOTTIE_ICONS.shopping}
                            autoPlay
                            loop
                            style={styles.moduleIcon}
                        />
                        <View style={styles.stepContainer}>
                            {steps[lang] && steps[lang][currentStep] ? (
                                <>
                                    <Text style={styles.stepTitle}>{steps[lang][currentStep].title}</Text>
                                    <Text style={styles.stepDescription}>{steps[lang][currentStep].description}</Text>
                                </>
                            ) : (
                                <Text style={styles.stepDescription}>Press start to begin!</Text>
                            )}
                        </View>

                        <View style={styles.recognitionContainer}>
                            <ScrollView style={styles.transcriptContainer}>
                                <Text style={styles.transcriptText}>{transcript}</Text>
                                {recognizing && (
                                    <Text style={styles.listeningText}>Listening...</Text>
                                )}
                            </ScrollView>
                        </View>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleNextStep}
                            accessibilityLabel="Next Step"
                        >
                            <Text style={styles.buttonText}>
                                {currentStep < steps[lang].length - 1 ? 'Next Step' : 'Complete Module'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.stopButton]}
                            onPress={stopAudio}
                            accessibilityLabel="Stop Audio"
                        >
                            <Text style={styles.buttonText}>Stop Audio</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {currentStep >= 0 && steps[lang] && (
                <View style={styles.progressContainer}>
                    <Slider
                        value={currentStep}
                        minimumValue={0}
                        maximumValue={steps[lang].length - 1}
                        step={1}
                        minimumTrackTintColor="#4CAF50"
                        maximumTrackTintColor="#E0E0E0"
                        thumbTintColor="#4CAF50"
                        disabled
                    />
                    <Text style={styles.progressText}>
                        Step {currentStep + 1} of {steps[lang].length}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 15,
    },
    moduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    moduleTitle: {
        fontSize: 24,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
    },
    voiceToggle: {
        fontSize: 16,
        color: '#4CAF50',
        fontFamily: 'Montserrat_500Medium',
    },
    moduleContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moduleIcon: {
        width: 200,
        height: 200,
    },
    stepContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 10,
    },
    stepDescription: {
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
        textAlign: 'center',
    },
    actionButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 10,
    },
    voiceButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        marginVertical: 5,
    },
    stopButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Montserrat_500Medium',
    },
    progressContainer: {
        marginTop: 20,
    },
    progressText: {
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
    },
    recognitionContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    transcriptContainer: {
        maxHeight: 100,
        width: '90%',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
    },
    transcriptText: {
        fontFamily: 'Montserrat_400Regular',
        color: '#333',
    },
});




export default ShoppingModule