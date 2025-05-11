import {useEffect, useState} from "react";
import {ExpoSpeechRecognitionModule, useSpeechRecognitionEvent} from "expo-speech-recognition";
import {ScrollView, TextInput, TouchableOpacity, Vibration, StyleSheet, View, Text} from "react-native";
import * as Speech from 'expo-speech';
import DeepSeekHelper from "./DeepSeekHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";


const API_KEY = 'YOUR DEEP SEEK API KEY PASTE HERE';
const deepSeekHelper = new DeepSeekHelper(API_KEY);


// Supported Languages
const LANGUAGES = {
    ENGLISH: 'en-US',
    SINHALA: 'si-LK',
    TAMIL: 'ta-LK'
};

// Voice commands in different languages
const VOICE_COMMANDS = {
    START: {
        [LANGUAGES.ENGLISH]: ['start', 'begin', 'listen'],
        [LANGUAGES.SINHALA]: ['පටන් ගන්න', 'ආරම්භ කරන්න', 'අසන්න'],
        [LANGUAGES.TAMIL]: ['தொடங்கு', 'ஆரம்பி', 'கேள்']
    },
    STOP: {
        [LANGUAGES.ENGLISH]: ['stop', 'end', 'finish'],
        [LANGUAGES.SINHALA]: ['නවත්වන්න', 'අවසන් කරන්න', 'ඉවරයි'],
        [LANGUAGES.TAMIL]: ['நிறுத்து', 'முடி', 'முடிவு']
    },
    SWITCH_LANGUAGE: {
        [LANGUAGES.ENGLISH]: ['switch to english', 'english', 'speak english'],
        [LANGUAGES.SINHALA]: ['සිංහලට මාරු වන්න', 'සිංහල', 'සිංහලෙන් කතා කරන්න'],
        [LANGUAGES.TAMIL]: ['தமிழுக்கு மாறவும்', 'தமிழ்', 'தமிழில் பேசுங்கள்']
    }
};

const ConversationBot = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES.ENGLISH);
    const [loading, setIsLoading] = useState(false);
    const [isCommandMode, setIsCommandMode] = useState(false);

    // Process voice commands
    const processVoiceCommand = (text) => {
        const lowerText = text.toLowerCase();

        // Check for start command
        if (!isListening) {
            // Check if any start command in any language is detected
            for (const lang in VOICE_COMMANDS.START) {
                if (VOICE_COMMANDS.START[lang].some(cmd => lowerText.includes(cmd))) {
                    startListening();
                    return true;
                }
            }
        }

        // Check for stop command
        if (isListening) {
            // Check if any stop command in any language is detected
            for (const lang in VOICE_COMMANDS.STOP) {
                if (VOICE_COMMANDS.STOP[lang].some(cmd => lowerText.includes(cmd))) {
                    stopListening();
                    return true;
                }
            }
        }

        // Check for language switch commands
        // English
        if (VOICE_COMMANDS.SWITCH_LANGUAGE[LANGUAGES.ENGLISH].some(cmd => lowerText.includes(cmd))) {
            changeLanguage(LANGUAGES.ENGLISH);
            return true;
        }
        // Sinhala
        if (VOICE_COMMANDS.SWITCH_LANGUAGE[LANGUAGES.SINHALA].some(cmd => lowerText.includes(cmd))) {
            changeLanguage(LANGUAGES.SINHALA);
            return true;
        }
        // Tamil
        if (VOICE_COMMANDS.SWITCH_LANGUAGE[LANGUAGES.TAMIL].some(cmd => lowerText.includes(cmd))) {
            changeLanguage(LANGUAGES.TAMIL);
            return true;
        }

        return false; // No command detected
    };

    // Listen for speech recognition events
    useSpeechRecognitionEvent(
        'onResult',
        (event) => {
            const text = event.value[0];

            // Check if the input is a command
            const isCommand = processVoiceCommand(text);

            // If not a command, update the input text
            if (!isCommand) {
                setInputText(text);
            }
        }
    );

    useSpeechRecognitionEvent(
        'onError',
        (event) => {
            console.error('Speech recognition error:', event);
            stopListening();
            // Provide haptic feedback for error
            Vibration.vibrate(500);
            speakText('Sorry, I couldn\'t hear you. Please try again');
        }
    );

    // Background listening for voice commands
    const startCommandListener = async () => {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) {
            console.error('Permissions not granted', result);
            return;
        }

        ExpoSpeechRecognitionModule.start({
            lang: currentLanguage,
            continuous: true,
            requiresOnDeviceRecognition: false
        });
        setIsCommandMode(true);
    };

    // Start listening function
    const startListening = async () => {
        if (isCommandMode) {
            // If we're already in command mode, stop it first
            await ExpoSpeechRecognitionModule.stop();
            setIsCommandMode(false);
        }

        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) {
            console.error('Permissions not granted', result);
            return;
        }

        // Start speech recognition
        ExpoSpeechRecognitionModule.start({
            lang: currentLanguage,
            continuous: true,
            requiresOnDeviceRecognition: false
        });
        setIsListening(true);
        // Provide haptic feedback to indicate listening started
        Vibration.vibrate(100);

        // Speak appropriate message based on current language
        const startMessages = {
            [LANGUAGES.ENGLISH]: "I'm listening",
            [LANGUAGES.SINHALA]: "මම අසනවා",
            [LANGUAGES.TAMIL]: "நான் கேட்கிறேன்"
        };
        speakText(startMessages[currentLanguage]);
    };

    // Stop listening function
    const stopListening = async () => {
        try {
            await ExpoSpeechRecognitionModule.stop();
            setIsListening(false);
            Vibration.vibrate([0, 100, 50, 100]);

            // Restart command mode listening
            setTimeout(() => {
                startCommandListener();
            }, 500);
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    };

    // Function to handle sending a message
    const handleSendMessage = async () => {
        if (inputText.trim() === '') return;

        // Add user message to conversation
        const userMessage = {
            text: inputText,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages(prevMessage => [...prevMessage, userMessage]);
        setIsLoading(true);
        setInputText('');
        try {
            // Call the DeepSeek API with the user's input
            const botResponse = await deepSeekHelper.generateResponse(
                inputText,
                currentLanguage
            );

            // Add bot message to conversation
            const botMessage = {
                text: botResponse,
                sender: 'bot',
                timestamp: new Date().toISOString()
            };

            setMessages(prevMessage => [...prevMessage, botMessage]);
            // Read out the response
            speakText(botResponse);
        } catch (error) {
            console.error('Error calling DeepSeek API:', error);
            // Provide a error feedback
            const errorMessages = {
                [LANGUAGES.ENGLISH]: "Sorry, I encountered a problem. Please try again later",
                [LANGUAGES.SINHALA]: "සමාවන්න, මට ගැටලුවක් ඇති වුණා. පසුව නැවත උත්සාහ කරන්න",
                [LANGUAGES.TAMIL]: "மன்னிக்கவும், எனக்கு ஒரு பிரச்சனை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்"
            };
            speakText(errorMessages[currentLanguage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to speak text aloud
    const speakText = async (text) => {
        try {
            await Speech.speak(text, {
                language: currentLanguage,
                pitch: 1.0,
                rate: 0.9,
            });
        } catch (error) {
            console.error('Error speaking text: ', error);
        }
    };

    // Helper function to get language name
    const getLanguageName = (langCode) => {
        switch (langCode) {
            case LANGUAGES.ENGLISH: return 'English';
            case LANGUAGES.SINHALA: return 'Sinhala';
            case LANGUAGES.TAMIL: return 'Tamil';
            default: return 'Unknown';
        }
    };

    // Change language function
    const changeLanguage = (langCode) => {
        setCurrentLanguage(langCode);
        const langName = getLanguageName(langCode);

        const announcements = {
            [LANGUAGES.ENGLISH]: `Language changed to English`,
            [LANGUAGES.SINHALA]: 'භාෂාව සිංහලට වෙනස් කරන ලදී',
            [LANGUAGES.TAMIL]: 'மொழி தமிழுக்கு மாற்றப்பட்டது'
        };

        speakText(announcements[langCode]);

        // Restart speech recognition with new language if currently listening
        if (isListening) {
            stopListening();
            setTimeout(() => {
                startListening();
            }, 1000);
        } else if (isCommandMode) {
            // Restart command listener with new language
            ExpoSpeechRecognitionModule.stop();
            setTimeout(() => {
                startCommandListener();
            }, 500);
        }
    };

    // Save conversation history
    useEffect(() => {
        const saveConversation = async () => {
            try {
                await AsyncStorage.setItem('conversationHistory', JSON.stringify(messages));
            } catch (error) {
                console.error('Error saving conversation history:', error);
            }
        };
        if (messages.length > 0) {
            saveConversation();
        }
    }, [messages]);

    // Load conversation history and start command listener
    useEffect(() => {
        const loadConversation = async () => {
            try {
                const savedMessage = await AsyncStorage.getItem('conversationHistory');
                if (savedMessage) {
                    setMessages(JSON.parse(savedMessage));
                }
            } catch (error) {
                console.error('Error loading conversation history: ', error);
            }
        };

        loadConversation();

        // Start background command listener when component mounts
        startCommandListener();

        // Clean up when component unmounts
        return () => {
            ExpoSpeechRecognitionModule.stop();
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.languageButtons}>
                <TouchableOpacity
                    style={[styles.langButton, currentLanguage === LANGUAGES.ENGLISH ? styles.activeLang : null]}
                    onPress={() => changeLanguage(LANGUAGES.ENGLISH)}
                    accessibilityLabel="Change to English"
                    accessibilityHint="Double tap to change the conversation language to English"
                >
                    <Text style={styles.langButtonText}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.langButton, currentLanguage === LANGUAGES.SINHALA ? styles.activeLang : null]}
                    onPress={() => changeLanguage(LANGUAGES.SINHALA)}
                    accessibilityLabel="Change to Sinhala"
                    accessibilityHint="Double tap to change the conversation language to Sinhala"
                >
                    <Text style={styles.langButtonText}>සිංහල</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.langButton, currentLanguage === LANGUAGES.TAMIL ? styles.activeLang : null]}
                    onPress={() => changeLanguage(LANGUAGES.TAMIL)}
                    accessibilityLabel="Change to Tamil"
                    accessibilityHint="Double tap to change the conversation language to Tamil"
                >
                    <Text style={styles.langButtonText}>தமிழ்</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                accessibilityLabel={`Conversation with ${messages.length} messages`}
            >
                {messages.map((message, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageBox,
                            message.sender === 'user' ? styles.userMessage : styles.botMessage
                        ]}
                        accessible={true}
                        accessibilityLabel={`${message.sender === 'user' ? 'You' : 'Assistant'} said: ${message.text}`}
                    >
                        <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                ))}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Thinking...</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type your message..."
                    placeholderTextColor="#888"
                    accessibilityLabel="Message input field"
                    accessibilityHint="Type your message here or use the microphone button to speak"
                />
                {isListening ? (
                    <TouchableOpacity
                        style={[styles.button, styles.listeningButton]}
                        onPress={stopListening}
                        accessibilityLabel="Stop listening"
                        accessibilityHint="Double tap to stop voice recording"
                    >
                        <Text style={styles.buttonText}>Stop</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={startListening}
                        accessibilityLabel="Start listening"
                        accessibilityHint="Double tap to start voice recording"
                    >
                        <Text style={styles.buttonText}>🎤</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.button, styles.sendButton]}
                    onPress={handleSendMessage}
                    disabled={loading || inputText.trim() === ''}
                    accessibilityLabel="Send message"
                    accessibilityHint="Double tap to send your message"
                >
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            </View>

            {/* Command mode indicator (optional) */}
            {isCommandMode && !isListening && (
                <View style={styles.commandModeIndicator}>
                    <Text style={styles.commandModeText}>
                        {currentLanguage === LANGUAGES.ENGLISH ? "Listening for commands..." :
                            currentLanguage === LANGUAGES.SINHALA ? "විධාන සඳහා සවන් දෙමින්..." :
                                "கட்டளைகளைக் கேட்கிறது..."}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    languageButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    langButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    activeLang: {
        backgroundColor: '#2196F3',
    },
    langButtonText: {
        fontWeight: 'bold',
        color: '#333',
    },
    messagesContainer: {
        flex: 1,
        marginBottom: 16,
    },
    messagesContent: {
        paddingVertical: 8,
    },
    messageBox: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#2196F3',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    loadingContainer: {
        alignSelf: 'center',
        marginVertical: 8,
    },
    loadingText: {
        fontStyle: 'italic',
        color: '#888',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        marginLeft: 8,
        padding: 12,
        borderRadius: 24,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listeningButton: {
        backgroundColor: '#f44336',
    },
    sendButton: {
        paddingHorizontal: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    commandModeIndicator: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 4,
        borderRadius: 8,
    },
    commandModeText: {
        fontSize: 10,
        color: '#666',
        fontStyle: 'italic',
    },
});

export default ConversationBot;