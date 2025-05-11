import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import LottieView from 'lottie-react-native';
import {LOTTIE_ICONS} from "../../../constants/LottieIcons";

// Placeholder for transportation animation
const BUS_ANIMATION = LOTTIE_ICONS.bus;
const TRAIN_ANIMATION = LOTTIE_ICONS.train;
const WALKING_ANIMATION = LOTTIE_ICONS.walking;

// Multi-language support
const translations = {
    en: {
        welcome: "Welcome to Smart Traveler! Let's practice taking public transportation.",
        chooseDest: "Where would you like to go today?",
        school: "School",
        library: "Library",
        park: "Park",
        hospital: "Hospital",
        mall: "Shopping Mall",
        destSelected: "You've selected to go to the",
        busTaken: "You need to take Bus",
        trainTaken: "You need to take Train",
        findStop: "Let's find the bus stop. Swipe right or say 'walk forward' to move.",
        findStation: "Let's find the train station. Swipe right or say 'walk forward' to move.",
        listenAnnouncement: "Listen carefully to the bus number before boarding.",
        busApproaching: "You hear a bus approaching.",
        busAnnouncement: "Bus NUMBER to DESTINATION!",
        trainAnnouncement: "Train to DESTINATION now arriving!",
        boardBus: "Board Bus",
        boardTrain: "Board Train",
        wrongTransport: "Oops! That's the wrong bus. Wait for the next one.",
        correctTransport: "Great! You've boarded the correct bus.",
        paymentMethod: "How would you like to pay?",
        travelCard: "Tap Travel Card",
        cash: "Cash",
        cardPaymentSuccess: "You tapped your travel card. Payment successful!",
        fareAmount: "The fare is $2.50. How much will you pay?",
        paymentSuccess: "You paid! Please take a seat.",
        insufficient: "That's not enough money. The fare is $2.50.",
        nextStop: "Next stop:",
        yourDestination: "This is your destination. Press 'Get Off' to exit.",
        getOff: "Get Off",
        stayOn: "Stay On",
        missedStop: "Oh no! You missed your stop. You'll need to take another bus back.",
        turnAround: "Turn Around",
        arrivalSuccess: "Great job! You've arrived at your destination!",
        tripSummary: "Trip Summary",
        correctChoices: "Correct choices made:",
        mistakesMade: "Mistakes made:",
        timeTaken: "Time taken:",
        totalCost: "Total cost of trip:",
        improvement: "Tips for improvement:",
        playAgain: "Play Again",
        askForHelp: "Ask for Help",
        help: "Excuse me, can you tell me how to get to",
        helpResponse: "Sure! You need to take",
        rainScenario: "It's starting to rain. You should find shelter at the bus stop quickly.",
        crowdedScenario: "The bus is very crowded. Say 'excuse me' to move through the crowd.",
        excuseMe: "Excuse me, coming through!",
        emergencyStop: "Emergency! Press the stop button to alert the driver.",
        pressStop: "Press Stop Button",
        walkForward: "walk forward",
        listenCommands: "Say 'help' for voice commands.",
        commands: "Available commands: 'walk forward', 'board bus', 'get off', 'ask for help', 'pay with card', 'pay with cash'",
    },
    si: {
        welcome: "Smart Traveler වෙත සාදරයෙන් පිළිගනිමු! පොදු ප්‍රවාහන පුහුණුව කරමු.",
        chooseDest: "අද ඔබට කොහේ යන්න අවශ්‍යද?",
        school: "පාසල",
        library: "පුස්තකාලය",
        park: "උද්‍යානය",
        hospital: "රෝහල",
        mall: "සාප්පු සංකීර්ණය",
        destSelected: "ඔබ තෝරාගෙන ඇත්තේ",
        busTaken: "ඔබට යන්න අවශ්‍ය බස් රථය",
        trainTaken: "ඔබට යන්න අවශ්‍ය දුම්රිය",
        findStop: "බස් නැවතුම්පොළ සොයමු. ඉදිරියට යාමට දකුණට ස්වයිප් කරන්න හෝ 'ඉදිරියට යන්න' කියන්න.",
        findStation: "දුම්රිය ස්ථානය සොයමු. ඉදිරියට යාමට දකුණට ස්වයිප් කරන්න හෝ 'ඉදිරියට යන්න' කියන්න.",
        listenAnnouncement: "ගොඩවීමට පෙර බස් අංකය හොඳින් අසන්න.",
        busApproaching: "බස් රථයක් ළඟා වන බව ඔබට ඇසෙනවා.",
        busAnnouncement: "NUMBER බස් රථය DESTINATION වෙත!",
        trainAnnouncement: "DESTINATION යන දුම්රිය දැන් පැමිණෙනවා!",
        boardBus: "NUMBER බස් රථයට ගොඩවන්න",
        boardTrain: "දුම්රියට ගොඩවන්න",
        wrongTransport: "අපොයි! ඒ වැරදි බස් රථයයි. ඊළඟ එක සඳහා රැඳී සිටින්න.",
        correctTransport: "හොඳයි! ඔබ නිවැරදි බස් රථයට ගොඩවී ඇත.",
        paymentMethod: "ඔබ කෙසේ ගෙවීමට කැමතිද?",
        travelCard: "ගමන් කාඩ්පත තට්ටු කරන්න",
        cash: "මුදල්",
        cardPaymentSuccess: "ඔබ ගමන් කාඩ්පත තට්ටු කළා. ගෙවීම සාර්ථකයි!",
        fareAmount: "ගාස්තුව රුපියල් 250කි. ඔබ කොපමණ ගෙවනවාද?",
        paymentSuccess: "ඔබ ගෙවා ඇත! කරුණාකර අසුන් ගන්න.",
        insufficient: "එය ප්‍රමාණවත් නොවේ. ගාස්තුව රුපියල් 250කි.",
        nextStop: "ඊළඟ නැවතුම්පොළ:",
        yourDestination: "මෙය ඔබේ ගමනාන්තයයි. පිටවීමට 'බහින්න' ඔබන්න.",
        getOff: "බහින්න",
        stayOn: "රැඳී සිටින්න",
        missedStop: "අපොයි! ඔබ නැවතුම්පොළ මඟ හැරියා. ඔබට ආපසු යාමට තවත් බස් රථයක් ගත යුතුය.",
        turnAround: "හැරෙන්න",
        arrivalSuccess: "හොඳ වැඩක්! ඔබ ඔබේ ගමනාන්තයට පැමිණ ඇත!",
        tripSummary: "ගමන් සාරාංශය",
        correctChoices: "කරන ලද නිවැරදි තේරීම්:",
        mistakesMade: "සිදු වූ වැරදි:",
        timeTaken: "ගතවූ කාලය:",
        totalCost: "ගමනේ මුළු පිරිවැය:",
        improvement: "වැඩිදියුණු කිරීම සඳහා ඉඟි:",
        playAgain: "නැවත සෙල්ලම් කරන්න",
        askForHelp: "උදව් ඉල්ලන්න",
        help: "සමාවන්න, මට කියන්න පුළුවන්ද",
        helpResponse: "ඔව්! ඔබට ගත යුතුයි",
        rainScenario: "වැස්ස පටන් ගන්නවා. ඔබ ඉක්මනින් බස් නැවතුම්පොළේ රැකවරණය සොයා ගත යුතුය.",
        crowdedScenario: "බස් රථය ඉතා තදබදය. සෙනඟ හරහා යාමට 'සමාවන්න' කියන්න.",
        excuseMe: "සමාවෙන්න, මම එනවා!",
        emergencyStop: "හදිසි! රියැදුරාට දැනුම් දීමට නැවතීමේ බොත්තම ඔබන්න.",
        pressStop: "නැවතීමේ බොත්තම ඔබන්න",
        walkForward: "ඉදිරියට යන්න",
        listenCommands: "හඬ විධාන සඳහා 'උදව්' කියන්න.",
        commands: "පවතින විධාන: 'ඉදිරියට යන්න', 'බස් රථයට ගොඩවන්න', 'බහින්න', 'උදව් ඉල්ලන්න', 'කාඩ්පතින් ගෙවන්න', 'මුදලින් ගෙවන්න'",
    },
    ta: {
        welcome: "Smart Traveler க்கு வரவேற்கிறோம்! பொது போக்குவரத்தை பயிற்சி செய்வோம்.",
        chooseDest: "இன்று நீங்கள் எங்கே செல்ல விரும்புகிறீர்கள்?",
        school: "பள்ளி",
        library: "நூலகம்",
        park: "பூங்கா",
        hospital: "மருத்துவமனை",
        mall: "ஷாப்பிங் மால்",
        destSelected: "நீங்கள் செல்வதைத் தேர்ந்தெடுத்துள்ளீர்கள்",
        busTaken: "நீங்கள் பஸ் எடுக்க வேண்டும்",
        trainTaken: "நீங்கள் ரயில் எடுக்க வேண்டும்",
        findStop: "பஸ் நிறுத்தத்தைக் கண்டுபிடிப்போம். முன்னோக்கி நகர வலமாக ஸ்வைப் செய்யவும் அல்லது 'முன்னால் நடக்கவும்' என்று சொல்லவும்.",
        findStation: "ரயில் நிலையத்தைக் கண்டுபிடிப்போம். முன்னோக்கி நகர வலமாக ஸ்வைப் செய்யவும் அல்லது 'முன்னால் நடக்கவும்' என்று சொல்லவும்.",
        listenAnnouncement: "ஏறுவதற்கு முன் பஸ் எண்ணைக் கவனமாகக் கேளுங்கள்.",
        busApproaching: "ஒரு பஸ் நெருங்குவதைக் கேட்கிறீர்கள்.",
        busAnnouncement: "பஸ் NUMBER to DESTINATION!",
        trainAnnouncement: "DESTINATION செல்லும் ரயில் இப்போது வந்துகொண்டிருக்கிறது!",
        boardBus: "பஸ் NUMBER ஏறவும்",
        boardTrain: "ரயிலில் ஏறவும்",
        wrongTransport: "அடடா! அது தவறான பஸ். அடுத்ததற்காகக் காத்திருங்கள்.",
        correctTransport: "அருமை! நீங்கள் சரியான பஸில் ஏறியுள்ளீர்கள்.",
        paymentMethod: "எப்படி செலுத்த விரும்புகிறீர்கள்?",
        travelCard: "பயண அட்டையைத் தட்டவும்",
        cash: "பணம்",
        cardPaymentSuccess: "நீங்கள் உங்கள் பயண அட்டையைத் தட்டினீர்கள். கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது!",
        fareAmount: "கட்டணம் ரூ.250. நீங்கள் எவ்வளவு செலுத்துவீர்கள்?",
        paymentSuccess: "நீங்கள் செலுத்தினீர்கள்! தயவுசெய்து உட்காரவும்.",
        insufficient: "அது போதாது. கட்டணம் ரூ.250.",
        nextStop: "அடுத்த நிறுத்தம்:",
        yourDestination: "இது உங்கள் இலக்கு. வெளியேற 'இறங்கு' ஐ அழுத்தவும்.",
        getOff: "இறங்கு",
        stayOn: "தொடரவும்",
        missedStop: "அடடா! நீங்கள் உங்கள் நிறுத்தத்தை தவறவிட்டீர்கள். நீங்கள் திரும்பிச் செல்ல மற்றொரு பஸ் எடுக்க வேண்டும்.",
        turnAround: "திரும்பவும்",
        arrivalSuccess: "அருமையான வேலை! நீங்கள் உங்கள் இலக்கை அடைந்துவிட்டீர்கள்!",
        tripSummary: "பயண சுருக்கம்",
        correctChoices: "சரியான தேர்வுகள் செய்யப்பட்டது:",
        mistakesMade: "செய்த தவறுகள்:",
        timeTaken: "எடுத்துக்கொண்ட நேரம்:",
        totalCost: "பயணத்தின் மொத்த செலவு:",
        improvement: "மேம்படுத்துவதற்கான குறிப்புகள்:",
        playAgain: "மீண்டும் விளையாடு",
        askForHelp: "உதவி கேட்க",
        help: "மன்னிக்கவும், எனக்கு எப்படி செல்வது என்று சொல்ல முடியுமா",
        helpResponse: "நிச்சயமாக! நீங்கள் எடுக்க வேண்டும்",
        rainScenario: "மழை பெய்யத் தொடங்குகிறது. நீங்கள் விரைவாக பஸ் நிறுத்தத்தில் தங்குமிடம் கண்டுபிடிக்க வேண்டும்.",
        crowdedScenario: "பஸ் மிகவும் நெரிசலாக உள்ளது. கூட்டத்தின் வழியாக நகர 'மன்னிக்கவும்' என்று சொல்லுங்கள்.",
        excuseMe: "மன்னிக்கவும், வந்துகொண்டிருக்கிறேன்!",
        emergencyStop: "அவசரம்! ஓட்டுனருக்கு எச்சரிக்க நிறுத்து பொத்தானை அழுத்தவும்.",
        pressStop: "நிறுத்து பொத்தானை அழுத்தவும்",
        walkForward: "முன்னால் நடக்கவும்",
        listenCommands: "குரல் கட்டளைகளுக்கு 'உதவி' என்று சொல்லுங்கள்.",
        commands: "கிடைக்கும் கட்டளைகள்: 'முன்னால் நடக்கவும்', 'பஸில் ஏறவும்', 'இறங்கவும்', 'உதவி கேட்கவும்', 'கார்டில் செலுத்தவும்', 'பணத்தில் செலுத்தவும்'",
    }
};

// Destinations and routes
const destinations = [
    {
        id: 'school',
        transport: 'bus',
        routeNumber: '25',
        stops: ['Downtown', 'Market Street', 'School Road', 'School'],
        fare: 2.50,
        scenario: 'normal'
    },
    {
        id: 'library',
        transport: 'bus',
        routeNumber: '37',
        stops: ['Downtown', 'Main Street', 'Park Avenue', 'Library'],
        fare: 2.00,
        scenario: 'rain'
    },
    {
        id: 'park',
        transport: 'train',
        routeNumber: '4',
        stops: ['Central Station', 'Westside', 'Northfield', 'City Park'],
        fare: 3.00,
        scenario: 'normal'
    },
    {
        id: 'hospital',
        transport: 'bus',
        routeNumber: '42',
        stops: ['Downtown', 'Bridge Road', 'Medical Center', 'Hospital'],
        fare: 2.50,
        scenario: 'crowded'
    },
    {
        id: 'mall',
        transport: 'train',
        routeNumber: '7',
        stops: ['Central Station', 'Eastside', 'Commerce Avenue', 'Shopping Mall'],
        fare: 3.50,
        scenario: 'normal'
    }
];

const languageCodes = {
    en: 'en-US',
    si: 'si-LK',
    ta: 'ta-LK',
};

export default function SmartTravelerGame({navigation,route}) {
    const [language, setLanguage] = useState('en');
    const [gameStage, setGameStage] = useState('intro'); // intro, destination, findStop, waitTransport, boarding, payment, journey, arrival, summary
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [currentStop, setCurrentStop] = useState(0);
    const [money, setMoney] = useState(10.00);
    const [recognizing, setRecognizing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [animation, setAnimation] = useState(null);
    const [approachingTransport, setApproachingTransport] = useState(null);
    const [correctChoices, setCorrectChoices] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [totalCost, setTotalCost] = useState(0);
    const [scenario, setScenario] = useState('normal');
    const [walkingSteps, setWalkingSteps] = useState(0);
    const [missedStop, setMissedStop] = useState(false);


    const [token,setToken] = useState(route.params?.token||'');

    const calculateTravelGameProgress = () => {
        const baseScore = correctChoices * 10;
        const penaltyPoints = mistakes * 5 ;

        const timeBonus = startTime ? Math.max(0, 100 - Math.floor((Date.now() - startTime) / 1000 / 60)) : 0; // Bonus for faster completion

        const progressValue = Math.max(0, baseScore - penaltyPoints + timeBonus);
        return progressValue;
    }

    const updateGameProgress = async () => {
        try {
            // Calculate progress value
            const progressValue = calculateTravelGameProgress();
    
            // Make API call to update progress
            const response = await axios.put(
                'https://skill-share-281536e63f1e.herokuapp.com/api/progress/game-progress/public-transport-game',
                { 
                    progressValue
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            // Log successful progress update
            console.log('Game progress updated:', response.data);
    
            // Optional: Reset game state after updating progress
            restartGame();
        } catch (error) {
            console.error('Error updating game progress:', error);
            
            // Show error to user
            Alert.alert(
                'Progress Update Failed',
                'Unable to save your game progress. Please check your internet connection.'
            );
        }
    };

    // Sound effects
    const busSound = useRef(null);
    const trainSound = useRef(null);
    const rainSound = useRef(null);
    const crowdSound = useRef(null);

    // Speech recognition hooks
    useSpeechRecognitionEvent("start", () => setRecognizing(true));
    useSpeechRecognitionEvent("end", () => setRecognizing(false));

    useSpeechRecognitionEvent("result", (event) => {
        const recognizedText = event.results[0]?.transcript.toLowerCase();
        setTranscript(recognizedText);
        processVoiceCommand(recognizedText);
    });

    useSpeechRecognitionEvent("error", (event) => {
        console.log("error code:", event.error, "error message:", event.message);
    });

    // Access translations for current language
    const t = translations[language];

    // Load sound effects
    useEffect(() => {
        const loadSounds = async () => {
            try {
                const { sound: busAudio } = await Audio.Sound.createAsync(
                    require('../../../assets/audio/other/bus-sound.wav')
                );
                busSound.current = busAudio;

                const { sound: trainAudio } = await Audio.Sound.createAsync(
                    require('../../../assets/audio/other/train-sound.wav')
                );
                trainSound.current = trainAudio;

                const { sound: rainAudio } = await Audio.Sound.createAsync(
                    require('../../../assets/audio/other/rain-sound.wav')
                );
                rainSound.current = rainAudio;

                const { sound: crowdAudio } = await Audio.Sound.createAsync(
                    require('../../../assets/audio/other/crowd-sound.wav')
                );
                crowdSound.current = crowdAudio;
            } catch (error) {
                console.error('Failed to load sounds', error);
            }
        };

        loadSounds();

        return () => {
            if (busSound.current) busSound.current.unloadAsync();
            if (trainSound.current) trainSound.current.unloadAsync();
            if (rainSound.current) rainSound.current.unloadAsync();
            if (crowdSound.current) crowdSound.current.unloadAsync();
        };
    }, []);

    // Helper function to speak text
    const speak = async (text) => {
        try {
            await Speech.speak(text, {
                language: languageCodes[language],
                pitch: 1.0,
                rate: 0.9,
            });
        } catch (error) {
            console.error('Speech error:', error);
        }
    };

    // Initialize game
    useEffect(() => {
        const startGame = async () => {
            await speak(t.welcome);
            setTimeout(() => {
                speak(t.chooseDest);
                setGameStage('destination');
            }, 2500);
            setTimeout(() => {
                speak(t.listenCommands);
            }, 5000);
        };

        startGame();
        setStartTime(Date.now());

        return () => {
            Speech.stop();
        };
    }, [language]);

    // Start speech recognition
    const startListening = async () => {
        try {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!result.granted) {
                console.warn("Permissions not granted", result);
                return;
            }

            // Start speech recognition with appropriate language
            ExpoSpeechRecognitionModule.start({
                lang: languageCodes[language],
                interimResults: true,
                maxAlternatives: 1,
                continuous: false,
            });
        } catch (error) {
            console.error('Speech recognition error:', error);
        }
    };

    // Process voice commands
    const processVoiceCommand = (command) => {
        if (!command) return;

        // Help command
        if (command.includes('help') || command.includes('උදව්') || command.includes('உதவி')) {
            speak(t.commands);
            return;
        }

        // Process commands based on game stage
        switch(gameStage) {
            case 'destination':
                // Check if destination name is in command
                destinations.forEach(dest => {
                    if (command.includes(t[dest.id].toLowerCase())) {
                        selectDestination(dest);
                    }
                });
                break;

            case 'findStop':
                if (command.includes(t.walkForward.toLowerCase())) {
                    walkForward();
                }
                break;

            case 'waitTransport':
                // Nothing to do here, just waiting
                break;

            case 'boarding':
                if (command.includes(t.boardBus.toLowerCase()) || command.includes(t.boardTrain.toLowerCase())) {
                    const transportNumber = extractNumberFromCommand(command);
                    boardTransport(transportNumber);
                }
                break;

            case 'payment':
                if (command.includes(t.travelCard.toLowerCase())) {
                    payWithCard();
                } else if (command.includes(t.cash.toLowerCase())) {
                    payWithCash();
                }
                break;

            case 'journey':
                if (command.includes(t.getOff.toLowerCase())) {
                    getOffTransport();
                } else if (command.includes(t.askForHelp.toLowerCase())) {
                    askForHelp();
                } else if (command.includes(t.excuseMe.toLowerCase())) {
                    excuseMe();
                } else if (command.includes(t.pressStop.toLowerCase())) {
                    emergencyStop();
                }
                break;

            case 'missed':
                if (command.includes(t.turnAround.toLowerCase())) {
                    turnAround();
                }
                break;

            default:
                break;
        }
    };

    // Extract number from voice command
    const extractNumberFromCommand = (command) => {
        const numberMatch = command.match(/\d+/);
        return numberMatch ? numberMatch[0] : null;
    };

    // Select destination
    const selectDestination = (destination) => {
        setSelectedDestination(destination);
        setScenario(destination.scenario);

        const transportType = destination.transport === 'bus'
            ? t.busTaken
            : t.trainTaken;

        speak(`${t.destSelected} ${t[destination.id]}. ${transportType} ${destination.routeNumber}.`);

        setTimeout(() => {
            if (destination.transport === 'bus') {
                speak(t.findStop);
                setAnimation(WALKING_ANIMATION);
            } else {
                speak(t.findStation);
                setAnimation(WALKING_ANIMATION);
            }
            setGameStage('findStop');
        }, 3000);
    };

    // Walk forward to find stop
    const walkForward = () => {
        setWalkingSteps(walkingSteps + 1);

        if (walkingSteps >= 2) {
            // Found the stop after 3 steps
            if (selectedDestination.transport === 'bus') {
                speak(t.listenAnnouncement);
                setAnimation(null);
            } else {
                speak(t.listenAnnouncement);
                setAnimation(null);
            }

            setTimeout(() => {
                speak(t.busApproaching);

                // Play appropriate sound based on transport type
                if (selectedDestination.transport === 'bus') {
                    busSound.current.playAsync();
                    setAnimation(BUS_ANIMATION);
                } else {
                    trainSound.current.playAsync();
                    setAnimation(TRAIN_ANIMATION);
                }

                // Play scenario sounds if applicable
                if (scenario === 'rain') {
                    rainSound.current.playAsync();
                    speak(t.rainScenario);
                } else if (scenario === 'crowded') {
                    crowdSound.current.playAsync();
                    speak(t.crowdedScenario);
                }

                setGameStage('waitTransport');

                // Generate approaching transports (one correct, one wrong)
                const correctRoute = selectedDestination.routeNumber;
                let wrongRoute;

                do {
                    wrongRoute = Math.floor(Math.random() * 50 + 1).toString();
                } while (wrongRoute === correctRoute);

                const transports = [
                    { number: correctRoute, isCorrect: true },
                    { number: wrongRoute, isCorrect: false }
                ];

                // Randomize order
                transports.sort(() => Math.random() - 0.5);
                setApproachingTransport(transports);

                setTimeout(() => {
                    // Announce the first approaching transport
                    const firstTransport = transports[0];
                    const announcement = selectedDestination.transport === 'bus'
                        ? t.busAnnouncement
                        : t.trainAnnouncement;

                    speak(announcement
                        .replace('NUMBER', firstTransport.number)
                        .replace('DESTINATION', t[selectedDestination.id]));

                    setGameStage('boarding');
                }, 3000);
            }, 2000);
        } else {
            // Still walking
            speak(t.walkForward);
        }
    };

    // Board transport
    const boardTransport = (transportNumber) => {
        if (!transportNumber) {
            // If no number provided in voice command, assume first option
            transportNumber = approachingTransport[0].number;
        }

        const isCorrect = approachingTransport.some(
            transport => transport.number === transportNumber && transport.isCorrect
        );

        if (isCorrect) {
            speak(t.correctTransport);
            setCorrectChoices(correctChoices + 1);

            // Set appropriate animation
            if (selectedDestination.transport === 'bus') {
                setAnimation(BUS_ANIMATION);
            } else {
                setAnimation(TRAIN_ANIMATION);
            }

            setTimeout(() => {
                speak(t.paymentMethod);
                setGameStage('payment');
            }, 2000);
        } else {
            speak(t.wrongTransport);
            setMistakes(mistakes + 1);

            // Generate a new correct transport
            setTimeout(() => {
                speak(t.busApproaching);

                // Announce the correct transport
                const correctTransport = approachingTransport.find(t => t.isCorrect);
                const announcement = selectedDestination.transport === 'bus'
                    ? t.busAnnouncement
                    : t.trainAnnouncement;

                speak(announcement
                    .replace('NUMBER', correctTransport.number)
                    .replace('DESTINATION', t[selectedDestination.id]));
            }, 3000);
        }
    };

    // Payment methods
    const payWithCard = () => {
        speak(t.cardPaymentSuccess);
        setTotalCost(totalCost + selectedDestination.fare);
        setCorrectChoices(correctChoices + 1);

        setTimeout(() => {
            startJourney();
        }, 2000);
    };

    const payWithCash = () => {
        speak(t.fareAmount.replace('2.50', selectedDestination.fare.toFixed(2)));

        // Simulate paying the exact amount
        if (money >= selectedDestination.fare) {
            setTimeout(() => {
                speak(t.paymentSuccess);
                setMoney(money - selectedDestination.fare);
                setTotalCost(totalCost + selectedDestination.fare);
                setCorrectChoices(correctChoices + 1);

                setTimeout(() => {
                    startJourney();
                }, 2000);
            }, 2000);
        } else {
            speak(t.insufficient.replace('2.50', selectedDestination.fare.toFixed(2)));
            setMistakes(mistakes + 1);
        }
    };

    // Start journey
    const startJourney = () => {
        setGameStage('journey');
        setCurrentStop(1); // Start from first stop after boarding

        announceNextStop();
    };

    // Announce next stop
    const announceNextStop = () => {
        if (currentStop < selectedDestination.stops.length) {
            const stopName = selectedDestination.stops[currentStop];
            speak(`${t.nextStop} ${stopName}`);

            // Check if this is destination
            if (currentStop === selectedDestination.stops.length - 1) {
                setTimeout(() => {
                    speak(t.yourDestination);
                }, 2000);
            }

            // Move to next stop after delay
            setTimeout(() => {
                setCurrentStop(currentStop + 1);

                // If not the last stop, announce next
                if (currentStop < selectedDestination.stops.length - 1) {
                    announceNextStop();
                }
            }, 5000);
        }
    };

    // Get off transport
    const getOffTransport = () => {
        // Check if this is the correct stop
        if (currentStop === selectedDestination.stops.length - 1 ||
            currentStop === selectedDestination.stops.length) {
            speak(t.arrivalSuccess);
            setCorrectChoices(correctChoices + 1);
            setGameStage('summary');

            // Calculate time taken
            const endTime = Date.now();
            const timeTaken = Math.floor((endTime - startTime) / 1000);
            setTotalCost(selectedDestination.fare);

            // Generate summary
            generateTripSummary(timeTaken);
        } else {
            // Got off at wrong stop
            speak(t.missedStop);
            setMistakes(mistakes + 1);
            setMissedStop(true);
            setGameStage('missed');
        }
    };

    // Turn around after missing stop
    const turnAround = () => {
        speak(t.findStop);
        setAnimation(WALKING_ANIMATION);
        setGameStage('findStop');
        setWalkingSteps(0);
    };

    // Ask for help
    const askForHelp = () => {
        speak(`${t.help} ${t[selectedDestination.id]}?`);
        setTimeout(() => {
            speak(`${t.helpResponse} ${selectedDestination.transport === 'bus' ? t.busTaken : t.trainTaken} ${selectedDestination.routeNumber}`);
            setCorrectChoices(correctChoices + 1);
        }, 2000);
    };

    // Handle crowded scenario
    const excuseMe = () => {
        if (scenario === 'crowded') {
            speak(t.excuseMe);
            setCorrectChoices(correctChoices + 1);
        }
    };

    // Handle emergency stop
    const emergencyStop = () => {
        speak(t.emergencyStop);
        speak(t.pressStop);
    };

    // Generate trip summary
    const generateTripSummary = (timeTaken) => {
        speak(t.tripSummary);
        speak(`${t.correctChoices} ${correctChoices}`);
        speak(`${t.mistakesMade} ${mistakes}`);
        speak(`${t.timeTaken} ${Math.floor(timeTaken / 60)} ${t.minutes} ${timeTaken % 60} ${t.seconds}`);
        speak(`${t.totalCost} $${totalCost.toFixed(2)}`);
    
        // Generate improvement tips based on mistakes
        if (mistakes > 0) {
            if (missedStop) {
                speak(`${t.improvement} ${t.watchStops}`);
            } else {
                speak(`${t.improvement} ${t.listenCarefully}`);
            }
        } else {
            speak(`${t.improvement} ${t.perfectScore}`);
        }
    
        // Call update game progress
        updateGameProgress();
    };

    // Restart game
    const restartGame = () => {
        // Reset all game state
        setGameStage('intro');
        setSelectedDestination(null);
        setCurrentStop(0);
        setMoney(10.00);
        setTranscript('');
        setAnimation(null);
        setApproachingTransport(null);
        setCorrectChoices(0);
        setMistakes(0);
        setStartTime(Date.now());
        setTotalCost(0);
        setScenario('normal');
        setWalkingSteps(0);
        setMissedStop(false);

        // Start game again
        speak(t.welcome);
        setTimeout(() => {
            speak(t.chooseDest);
            setGameStage('destination');
        }, 2500);
    };

    // Render different game stages
    const renderGameStage = () => {
        switch (gameStage) {
            case 'intro':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.title, styles.largeText]}>{t.welcome}</Text>
                    </View>
                );

            case 'destination':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.instructions, styles.largeText]}>{t.chooseDest}</Text>
                        <View style={styles.controlButtons}>
                            {destinations.map(dest => (
                                <TouchableOpacity
                                    key={dest.id}
                                    style={styles.button}
                                    onPress={() => selectDestination(dest)}
                                    accessible={true}
                                    accessibilityLabel={t[dest.id]}
                                    accessibilityHint={`${t.selectTo} ${t[dest.id]}`}
                                >
                                    <Text style={[styles.buttonText, styles.largeText]}>{t[dest.id]}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'findStop':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.instructions, styles.largeText]}>
                            {selectedDestination?.transport === 'bus' ? t.findStop : t.findStation}
                        </Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={walkForward}
                            accessible={true}
                            accessibilityLabel={t.walkForward}
                            accessibilityHint={t.tapToWalk}
                        >
                            <Text style={[styles.buttonText, styles.largeText]}>{t.walkForward}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'waitTransport':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.instructions, styles.largeText]}>{t.listenAnnouncement}</Text>
                        {scenario === 'rain' && (
                            <Text style={[styles.instructions, styles.largeText]}>{t.rainScenario}</Text>
                        )}
                        {scenario === 'crowded' && (
                            <Text style={[styles.instructions, styles.largeText]}>{t.crowdedScenario}</Text>
                        )}
                    </View>
                );

            case 'boarding':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.instructions, styles.largeText]}>
                            {approachingTransport && approachingTransport[0] &&
                                (selectedDestination?.transport === 'bus'
                                        ? t.busAnnouncement.replace('NUMBER', approachingTransport[0].number).replace('DESTINATION', t[selectedDestination.id])
                                        : t.trainAnnouncement.replace('DESTINATION', t[selectedDestination.id])
                                )
                            }
                        </Text>
                        <View style={styles.controlButtons}>
                            {approachingTransport && approachingTransport.map((transport, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.button}
                                    onPress={() => boardTransport(transport.number)}
                                    accessible={true}
                                    accessibilityLabel={`${selectedDestination?.transport === 'bus' ? t.boardBus : t.boardTrain} ${transport.number}`}
                                    accessibilityHint={`${t.tapToBoard} ${transport.number}`}
                                >
                                    <Text style={[styles.buttonText, styles.largeText]}>
                                        {selectedDestination?.transport === 'bus'
                                            ? t.boardBus.replace('NUMBER', transport.number)
                                            : t.boardTrain
                                        }
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'payment':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.instructions, styles.largeText]}>{t.paymentMethod}</Text>
                        <View style={styles.paymentOptions}>
                            <TouchableOpacity
                                style={styles.paymentButton}
                                onPress={payWithCard}
                                accessible={true}
                                accessibilityLabel={t.travelCard}
                                accessibilityHint={t.tapToPayCard}
                            >
                                <Text style={[styles.buttonText, styles.largeText]}>{t.travelCard}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.paymentButton}
                                onPress={payWithCash}
                                accessible={true}
                                accessibilityLabel={t.cash}
                                accessibilityHint={t.tapToPayCash}
                            >
                                <Text style={[styles.buttonText, styles.largeText]}>{t.cash}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.instructions, styles.largeText]}>
                            {t.moneyLeft}: ${money.toFixed(2)}
                        </Text>
                    </View>
                );

            case 'journey':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.instructions, styles.largeText]}>
                            {currentStop < selectedDestination?.stops.length
                                ? `${t.nextStop} ${selectedDestination?.stops[currentStop]}`
                                : `${t.nextStop} ${selectedDestination?.stops[selectedDestination?.stops.length - 1]}`
                            }
                        </Text>
                        {(currentStop === selectedDestination?.stops.length - 1 ||
                            currentStop === selectedDestination?.stops.length) && (
                            <Text style={[styles.instructions, styles.largeText]}>{t.yourDestination}</Text>
                        )}
                        <View style={styles.controlButtons}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={getOffTransport}
                                accessible={true}
                                accessibilityLabel={t.getOff}
                                accessibilityHint={t.tapToGetOff}
                            >
                                <Text style={[styles.buttonText, styles.largeText]}>{t.getOff}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={askForHelp}
                                accessible={true}
                                accessibilityLabel={t.askForHelp}
                                accessibilityHint={t.tapToAskHelp}
                            >
                                <Text style={[styles.buttonText, styles.largeText]}>{t.askForHelp}</Text>
                            </TouchableOpacity>
                            {scenario === 'crowded' && (
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={excuseMe}
                                    accessible={true}
                                    accessibilityLabel={t.excuseMe}
                                    accessibilityHint={t.tapToExcuse}
                                >
                                    <Text style={[styles.buttonText, styles.largeText]}>{t.excuseMe}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                );

            case 'missed':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.instructions, styles.largeText]}>{t.missedStop}</Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={turnAround}
                            accessible={true}
                            accessibilityLabel={t.turnAround}
                            accessibilityHint={t.tapToTurnAround}
                        >
                            <Text style={[styles.buttonText, styles.largeText]}>{t.turnAround}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'summary':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={[styles.title, styles.largeText]}>{t.tripSummary}</Text>
                        <View style={styles.summaryContainer}>
                            <Text style={[styles.summaryText, styles.largeText]}>{t.correctChoices} {correctChoices}</Text>
                            <Text style={[styles.summaryText, styles.largeText]}>{t.mistakesMade} {mistakes}</Text>
                            <Text style={[styles.summaryText, styles.largeText]}>
                                {t.totalCost} ${totalCost.toFixed(2)}
                            </Text>
                            <Text style={[styles.summaryText, styles.largeText]}>
                                {t.improvement}
                                {mistakes > 0
                                    ? (missedStop ? t.watchStops : t.listenCarefully)
                                    : t.perfectScore
                                }
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.restartButton}
                            onPress={restartGame}
                            accessible={true}
                            accessibilityLabel={t.playAgain}
                            accessibilityHint={t.tapToRestart}
                        >
                            <Text style={[styles.buttonText, styles.largeText]}>{t.playAgain}</Text>
                        </TouchableOpacity>
                    </View>
                );

            default:
                return null;
        }
    };

    // Render language switcher
    const renderLanguageSwitcher = () => (
        <View style={styles.languageSwitcher}>
            <TouchableOpacity
                style={[styles.langButton, language === 'en' && styles.activeLang]}
                onPress={() => setLanguage('en')}
                accessible={true}
                accessibilityLabel="English"
                accessibilityHint="Switch to English language"
            >
                <Text style={[styles.langText, styles.largeText]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.langButton, language === 'si' && styles.activeLang]}
                onPress={() => setLanguage('si')}
                accessible={true}
                accessibilityLabel="සිංහල"
                accessibilityHint="Switch to Sinhala language"
            >
                <Text style={[styles.langText, styles.largeText]}>සිංහල</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.langButton, language === 'ta' && styles.activeLang]}
                onPress={() => setLanguage('ta')}
                accessible={true}
                accessibilityLabel="தமிழ்"
                accessibilityHint="Switch to Tamil language"
            >
                <Text style={[styles.langText, styles.largeText]}>தமிழ்</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderLanguageSwitcher()}

            {/* Animation container */}
            {animation && (
                <View style={styles.animationContainer}>
                    <LottieView
                        source={animation}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                </View>
            )}

            {/* Main game content */}
            {renderGameStage()}

            {/* Voice recognition button */}
            <View style={styles.voiceContainer}>
                <TouchableOpacity
                    style={[styles.voiceButton, recognizing && styles.listeningButton]}
                    onPress={startListening}
                    accessible={true}
                    accessibilityLabel={recognizing ? t.listening : t.tapToSpeak}
                    accessibilityHint={recognizing ? t.listeningHint : t.speakHint}
                >
                    <Text style={[styles.voiceButtonText, styles.largeText]}>
                        {recognizing ? t.listening : t.speak}
                    </Text>
                </TouchableOpacity>
                {transcript ? (
                    <Text style={[styles.transcriptText, styles.largeText]}>
                        {t.youSaid}: {transcript}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}

// Updated styles for accessibility
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
    itemContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        marginBottom: 20,
        width: '90%',
    },
    itemName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 20,
        color: '#4a90e2',
    },
    cartInfo: {
        marginBottom: 20,
        alignItems: 'center',
    },
    cartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cartItems: {
        fontSize: 16,
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
    summaryContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        marginBottom: 20,
    },
    summaryText: {
        fontSize: 18,
        marginBottom: 10,
    },
    paymentOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    paymentButton: {
        backgroundColor: '#4a90e2',
        padding: 20,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    restartButton: {
        backgroundColor: '#4a90e2',
        padding: 20,
        borderRadius: 8,
        width: '60%',
        alignItems: 'center',
        marginTop: 20,
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