import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import * as Speech from 'expo-speech';
import {LOTTIE_ICONS} from "../../../constants/LottieIcons";
import axios from 'axios';

const LANGUAGES = {
    ENGLISH: 'en-US',
    SINHALA: 'si-LK',
    TAMIL: 'ta-LK'
};

const COMMANDS = {
    [LANGUAGES.ENGLISH]: {
        GO: ['go', 'cross', 'walk'],
        STOP: ['stop', 'wait', 'halt']
    },
    [LANGUAGES.SINHALA]: {
        GO: ['yanna', 'yadhi', 'gamankara'],
        STOP: ['navatinna', 'inna', 'rendi']
    },
    [LANGUAGES.TAMIL]: {
        GO: ['po', 'kada', 'nadai'],
        STOP: ['niruth', 'wait', 'nillu']
    }
};

const VOICE_PROMPTS = {
    [LANGUAGES.ENGLISH]: {
        WELCOME: "Welcome to the Safe Road Crossing Game. Listen carefully to traffic sounds.",
        LISTEN: "Stop! Listen for traffic. Say 'Go' to cross when it's safe.",
        SUCCESS: "Great job! You crossed safely!",
        FAILURE: "Oh no! It wasn't safe to cross. Always wait until traffic stops.",
        INSTRUCTIONS: "In this game, you'll hear traffic sounds. When the traffic stops, say 'Go' to cross the road. If you hear traffic, say 'Stop' to wait."
    },
    [LANGUAGES.SINHALA]: {
        WELCOME: "ආරක්ෂිත මාර්ග තරණය කිරීමේ ක්‍රීඩාවට සාදරයෙන් පිළිගනිමු. රථවාහන ශබ්දවලට හොඳින් සවන් දෙන්න.",
        LISTEN: "නවතින්න! රථවාහන හඳුනා ගැනීමට සවන් දෙන්න. ආරක්ෂිත විට 'යන්න' කියන්න.",
        SUCCESS: "ඔබ හොඳින් කළා! ඔබ ආරක්ෂිතව මාරු වුණා!",
        FAILURE: "අපොයි! මාරු වීමට ආරක්ෂිත නොවීය. රථවාහන නවතින තුරු සෑම විටම රැඳී සිටින්න.",
        INSTRUCTIONS: "මෙම ක්‍රීඩාවේදී, ඔබට රථවාහන ශබ්ද ඇසෙනු ඇත. රථවාහන නැවතුණු විට, මාර්ගය හරහා යාමට 'යන්න' කියන්න. ඔබට රථවාහන ඇසෙන්නේ නම්, 'නවතින්න' කියන්න."
    },
    [LANGUAGES.TAMIL]: {
        WELCOME: "பாதுகாப்பான சாலை கடக்கும் விளையாட்டுக்கு வரவேற்கிறோம். போக்குவரத்து ஒலிகளை கவனமாக கேளுங்கள்.",
        LISTEN: "நிறுத்துங்கள்! போக்குவரத்துக்காக கேளுங்கள். பாதுகாப்பாக இருக்கும்போது 'போ' என்று சொல்லுங்கள்.",
        SUCCESS: "அருமை! நீங்கள் பாதுகாப்பாக கடந்தீர்கள்!",
        FAILURE: "அடடா! கடக்க பாதுகாப்பாக இல்லை. போக்குவரத்து நிற்கும் வரை எப்போதும் காத்திருங்கள்.",
        INSTRUCTIONS: "இந்த விளையாட்டில், நீங்கள் போக்குவரத்து ஒலிகளைக் கேட்பீர்கள். போக்குவரத்து நிற்கும்போது, சாலையைக் கடக்க 'போ' என்று சொல்லுங்கள். போக்குவரத்து கேட்டால், 'நிறுத்து' என்று சொல்லுங்கள்."
    }
};

export default function CrossingStreetGame({navigation,route}) {
    const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES.ENGLISH);
    const [gameStage, setGameStage] = useState('instructions'); // 'instructions', 'playing', 'result'
    const [isTrafficActive, setIsTrafficActive] = useState(false);
    const [recognizing, setRecognizing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [score, setScore] = useState(0);
    const [totalRounds,setTotalRounds] = useState(0);
    const [token,setToken] = useState(route.params?.token || '');

    const trafficSound = useRef(null);
    const animationRef = useRef(null);
    const timerRef = useRef(null);

    const calculateRoadCrossingGameProgress = (score, totalRounds) => {
        // If no rounds played, return 0
        if (totalRounds === 0) return 0;

        // Calculate success rate
        const successRate = (score / totalRounds) * 100;
        
        // Progressively calculate progress
        let progressScore = 0;
        if (successRate === 0) {
            progressScore = 0;
        } else if (successRate < 20) {
            progressScore = 20;
        } else if (successRate < 40) {
            progressScore = 40;
        } else if (successRate < 60) {
            progressScore = 60;
        } else if (successRate < 80) {
            progressScore = 80;
        } else {
            progressScore = 100;
        }

        return progressScore;
    };



    


    // Speech recognition event handlers
    useSpeechRecognitionEvent("start", () => setRecognizing(true));
    useSpeechRecognitionEvent("end", () => setRecognizing(false));
    useSpeechRecognitionEvent("result", (event) => {
        const heard = event.results[0]?.transcript.toLowerCase();
        setTranscript(heard);

        if (gameStage === 'playing') {
            processVoiceCommand(heard);
        }
    });
    useSpeechRecognitionEvent("error", (event) => {
        console.log("error code:", event.error, "error message:", event.message);
    });

    // Start speech recognition with permission check
    const startListening = async () => {
        try {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!result.granted) {
                speakText("Microphone permission is required for this game.");
                return;
            }

            ExpoSpeechRecognitionModule.start({
                lang: currentLanguage,
                interimResults: true,
                maxAlternatives: 1,
                continuous: true,
                requiresOnDeviceRecognition: false,
                addsPunctuation: false,
                contextualStrings: [...COMMANDS[currentLanguage].GO, ...COMMANDS[currentLanguage].STOP],
            });
        } catch (error) {
            console.error("Error starting speech recognition:", error);
        }
    };

    // Process voice commands
    const processVoiceCommand = (command) => {
        const currentCommands = COMMANDS[currentLanguage];

        if (currentCommands.GO.some(cmd => command.includes(cmd))) {
            handleGoCommand();
        } else if (currentCommands.STOP.some(cmd => command.includes(cmd))) {
            handleStopCommand();
        }
    };

    const handleGoCommand = () => {
        if (!isTrafficActive) {
            // Correct decision - safe to cross
            showResult(true);
        } else {
            // Incorrect decision - not safe to cross
            showResult(false);
        }
    };

    const handleStopCommand = () => {
        if (isTrafficActive) {
            // Correct decision - not safe to cross
            speakText(VOICE_PROMPTS[currentLanguage].LISTEN);
        } else {
            // They said stop when it was safe to go - that's okay, just remind them
            speakText("Remember to say 'Go' when it's safe to cross.");
        }
    };

    // Play traffic sounds
    const playTrafficSounds = async () => {
        try {
            if (trafficSound.current) {
                await trafficSound.current.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync(
                require('../../../assets/audio/other/traffic-sound.mp3'),
                { shouldPlay: true, isLooping: false }
            );

            trafficSound.current = sound;
            setIsTrafficActive(true);

            // Traffic sound plays for 10 seconds
            timerRef.current = setTimeout(() => {
                setIsTrafficActive(false);
                speakText(VOICE_PROMPTS[currentLanguage].LISTEN);

                // After 10 seconds of silence, start traffic again
                timerRef.current = setTimeout(() => {
                    playTrafficSounds();
                }, 10000);
            }, 10000);
        } catch (error) {
            console.error("Error playing traffic sounds:", error);
        }
    };

    // Text-to-speech function
    const speakText = async (text) => {
        try {
            await Speech.speak(text, {
                language: currentLanguage,
                pitch: 1.0,
                rate: 0.9,
            });
        } catch (error) {
            console.error("Error speaking text:", error);
        }
    };

    // Show game result
    const showResult = (success) => {
        stopTrafficSounds();
        
        // Increment total rounds
        setTotalRounds(prevRounds => {
            const newTotalRounds = prevRounds + 1;
            
            // Check if we should update progress (e.g., after 5 rounds)
            if (newTotalRounds >= 5) {
                updateGameProgress(success ? score + 1 : score, newTotalRounds);
            }
            
            return newTotalRounds;
        });

        if (success) {
            speakText(VOICE_PROMPTS[currentLanguage].SUCCESS);
            setScore(prevScore => prevScore + 1);
            if (animationRef.current) {
                animationRef.current.play();
            }
        } else {
            speakText(VOICE_PROMPTS[currentLanguage].FAILURE);
        }

        setGameStage('result');

        // Continue game after feedback
        setTimeout(() => {
            setGameStage('playing');
            playTrafficSounds();
        }, 5000);
    };

    const updateGameProgress = async (currentScore, currentTotalRounds) => {
        try {
            // Calculate progress based on score and total rounds
            const progressValue = calculateRoadCrossingGameProgress(
                currentScore, 
                currentTotalRounds
            );

            // Make API call to update progress
            const response = await axios.put(
                'https://skill-share-281536e63f1e.herokuapp.com/api/progress/game-progress/road-crossing-game', 
                { progressValue },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Optional: Log successful progress update
            console.log('Game progress updated:', response.data);

            // Reset score and total rounds after updating progress
            setScore(0);
            setTotalRounds(0);
        } catch (error) {
            console.error('Error updating game progress:', error);
            
            // Show error to user
            Alert.alert(
                'Progress Update Failed', 
                'Unable to save your game progress. Please check your internet connection.'
            );
        }
    };
    // Stop traffic sounds
    const stopTrafficSounds = async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (trafficSound.current) {
            try {
                await trafficSound.current.stopAsync();
                await trafficSound.current.unloadAsync();
            } catch (error) {
                console.error("Error stopping traffic sounds:", error);
            }
        }
    };

    // Change language
    const changeLanguage = (language) => {
        setCurrentLanguage(language);
        if (gameStage === 'instructions') {
            speakText(VOICE_PROMPTS[language].INSTRUCTIONS);
        } else {
            speakText(VOICE_PROMPTS[language].WELCOME);
        }
    };

    // Start game
    const startGame = () => {
        setGameStage('playing');
        speakText(VOICE_PROMPTS[currentLanguage].WELCOME);
        playTrafficSounds();
        startListening();
    };

    // Clean up resources when component unmounts
    useEffect(() => {
        return () => {
            stopTrafficSounds();
            if (recognizing) {
                ExpoSpeechRecognitionModule.stop();
            }
        };
    }, [recognizing]);

    // Initial instructions
    useEffect(() => {
        if (gameStage === 'instructions') {
            speakText(VOICE_PROMPTS[currentLanguage].INSTRUCTIONS);
        }
    }, [gameStage, currentLanguage]);

    return (
        <View style={styles.container}>
            {/* Language Switcher */}
            <View style={styles.languageSwitcher}>
                <TouchableOpacity
                    style={[styles.langButton, currentLanguage === LANGUAGES.ENGLISH && styles.activeLang]}
                    onPress={() => changeLanguage(LANGUAGES.ENGLISH)}
                >
                    <Text style={styles.langText}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.langButton, currentLanguage === LANGUAGES.SINHALA && styles.activeLang]}
                    onPress={() => changeLanguage(LANGUAGES.SINHALA)}
                >
                    <Text style={styles.langText}>සිංහල</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.langButton, currentLanguage === LANGUAGES.TAMIL && styles.activeLang]}
                    onPress={() => changeLanguage(LANGUAGES.TAMIL)}
                >
                    <Text style={styles.langText}>தமிழ்</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.stageContainer}>
                {gameStage === 'instructions' && (
                    <>
                        <Text style={styles.title}>Safe Road Crossing Game</Text>
                        <Text style={styles.instructions}>
                            Learn to cross the road safely by listening to traffic sounds.
                        </Text>
                        <View style={styles.animationContainer}>
                            <LottieView
                                ref={animationRef}
                                style={styles.animation}
                                source={LOTTIE_ICONS.crossingGame}
                                autoPlay
                                loop
                            />
                        </View>
                        <TouchableOpacity style={styles.button} onPress={startGame}>
                            <Text style={styles.buttonText}>Start Game</Text>
                        </TouchableOpacity>
                    </>
                )}

                {gameStage === 'playing' && (
                    <>
                        <Text style={styles.title}>Listen Carefully</Text>
                        <View style={styles.animationContainer}>
                            <LottieView
                                ref={animationRef}
                                style={styles.animation}
                                source={LOTTIE_ICONS.listening}
                                autoPlay
                                loop
                            />
                        </View>
                        <View style={styles.voiceContainer}>
                            <TouchableOpacity
                                style={[styles.voiceButton, recognizing && styles.listeningButton]}
                                onPress={startListening}
                            >
                                <Text style={styles.voiceButtonText}>
                                    {recognizing ? "Listening..." : "Start Listening"}
                                </Text>
                            </TouchableOpacity>
                            <Text style={styles.transcriptText}>{transcript}</Text>
                        </View>
                        <Text style={styles.instructions}>
                            {isTrafficActive ?
                                "Traffic is moving. Listen carefully." :
                                "Traffic has stopped. Is it safe to cross?"}
                        </Text>
                        <Text style={styles.instructions}>
                            Score: {score}
                        </Text>
                    </>
                )}

                {gameStage === 'result' && (
                    <>
                        <Text style={styles.title}>Result</Text>
                        <View style={styles.animationContainer}>
                            <LottieView
                                ref={animationRef}
                                style={styles.animation}
                                source={LOTTIE_ICONS.success}
                                loop={false}
                            />
                        </View>
                        <Text style={styles.instructions}>
                            Score: {score}
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    languageSwitcher: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    langButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#ddd',
    },
    activeLang: {
        backgroundColor: '#4a90e2',
    },
    langText: {
        fontSize: 16,
    },
    animationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        marginVertical: 10,
    },
    animation: {
        width: 200,
        height: 200,
    },
    stageContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    instructions: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
    },
    controlButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#4a90e2',
        padding: 15,
        margin: 5,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    voiceContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    voiceButton: {
        backgroundColor: '#4a90e2',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginBottom: 10,
    },
    listeningButton: {
        backgroundColor: '#e74c3c',
    },
    voiceButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    transcriptText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});