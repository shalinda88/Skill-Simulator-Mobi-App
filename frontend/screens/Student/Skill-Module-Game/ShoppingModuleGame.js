import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import LottieView from 'lottie-react-native';
import {LOTTIE_ICONS} from "../../../constants/LottieIcons";
import axios from 'axios';

// Multi-language support
const translations = {
    en: {
        welcome: "Welcome to Smart Shopper! Let's practice shopping.",
        instructions: "Your shopping list: 1 apple, 1 bread, and 1 milk. You have $10.",
        nextItem: "next item",
        select: "select",
        add: "add",
        cancel: "cancel",
        checkout: "checkout",
        cash: "cash",
        card: "card",
        itemSelected: "You selected",
        cost: "They cost",
        addToCart: "Add to cart?",
        addedToCart: "Added to your cart!",
        remainingBalance: "Your remaining balance is",
        notEnoughMoney: "You don't have enough money for that.",
        totalPrice: "Your total price is",
        paymentMethod: "How would you like to pay? Cash or card?",
        paidWithCash: "You paid with cash. Your change is",
        paidWithCard: "Payment completed with card.",
        congratulations: "Congratulations! You've successfully completed your shopping.",
        summary: "You bought",
        remaining: "and have",
        remaining2: "left.",
        helpPrompt: "Say 'help' for voice commands.",
        helpCommands: "Voice commands: 'next item', 'select [item]', 'add to cart', 'cancel', 'checkout', 'pay with cash', 'pay with card'.",
    },
    si: {
        welcome: "Smart Shopper වෙත සාදරයෙන් පිළිගනිමු! අපි සාප්පු සවාරි පුහුණු කරමු.",
        instructions: "ඔබගේ සාප්පු ලැයිස්තුව: ඇපල් 1, පාන් 1, සහ කිරි 1. ඔබට $10 තිබේ.",
        nextItem: "ඊළඟ අයිතමය",
        select: "තෝරන්න",
        add: "එකතු කරන්න",
        cancel: "අවලංගු කරන්න",
        checkout: "ගෙවන්න",
        cash: "මුදල්",
        card: "කාඩ්",
        itemSelected: "ඔබ තෝරා ඇත",
        cost: "ඒවා වියදම",
        addToCart: "කරත්තයට එකතු කරන්නද?",
        addedToCart: "ඔබගේ කරත්තයට එකතු කරන ලදී!",
        remainingBalance: "ඔබගේ ඉතිරි ශේෂය",
        notEnoughMoney: "ඔබට ඒ සඳහා ප්‍රමාණවත් මුදල් නැත.",
        totalPrice: "ඔබගේ මුළු මිල",
        paymentMethod: "ඔබ කෙසේ ගෙවීමට කැමතිද? මුදල් හෝ කාඩ්?",
        paidWithCash: "ඔබ මුදලින් ගෙවා ඇත. ඔබගේ ඉතිරි මුදල්",
        paidWithCard: "කාඩ් එකෙන් ගෙවීම සම්පූර්ණයි.",
        congratulations: "සුභ පැතුම්! ඔබ සාර්ථකව ඔබේ සාප්පු සවාරිය අවසන් කර ඇත.",
        summary: "ඔබ මිලදී ගත්තේ",
        remaining: "සහ",
        remaining2: "ඉතිරි වී ඇත.",
        helpPrompt: "හඬ විධාන සඳහා 'උදව්' කියන්න.",
        helpCommands: "හඬ විධාන: 'ඊළඟ අයිතමය', 'තෝරන්න [අයිතමය]', 'කරත්තයට එකතු කරන්න', 'අවලංගු කරන්න', 'ගෙවන්න', 'මුදලින් ගෙවන්න', 'කාඩ් එකෙන් ගෙවන්න'.",
    },
    ta: {
        welcome: "Smart Shopper க்கு வரவேற்கிறோம்! கடை பயிற்சி செய்வோம்.",
        instructions: "உங்கள் கடை பட்டியல்: 1 ஆப்பிள், 1 ரொட்டி, மற்றும் 1 பால். உங்களிடம் $10 உள்ளது.",
        nextItem: "அடுத்த பொருள்",
        select: "தேர்ந்தெடு",
        add: "சேர்",
        cancel: "ரத்து செய்",
        checkout: "கட்டணம் செலுத்த",
        cash: "பணம்",
        card: "அட்டை",
        itemSelected: "நீங்கள் தேர்ந்தெடுத்துள்ளீர்கள்",
        cost: "அவற்றின் விலை",
        addToCart: "கார்ட்டில் சேர்க்கவா?",
        addedToCart: "உங்கள் கார்ட்டில் சேர்க்கப்பட்டது!",
        remainingBalance: "உங்கள் மீதமுள்ள இருப்பு",
        notEnoughMoney: "அதற்கு உங்களிடம் போதுமான பணம் இல்லை.",
        totalPrice: "உங்கள் மொத்த விலை",
        paymentMethod: "எப்படி செலுத்த விரும்புகிறீர்கள்? பணமா அல்லது அட்டையா?",
        paidWithCash: "நீங்கள் பணத்தில் செலுத்தியுள்ளீர்கள். உங்கள் மீதி",
        paidWithCard: "அட்டையுடன் பணம் செலுத்துதல் முடிந்தது.",
        congratulations: "வாழ்த்துக்கள்! நீங்கள் வெற்றிகரமாக உங்கள் ஷாப்பிங்கை முடித்துவிட்டீர்கள்.",
        summary: "நீங்கள் வாங்கினீர்கள்",
        remaining: "மற்றும்",
        remaining2: "மீதம் உள்ளது.",
        helpPrompt: "குரல் கட்டளைகளுக்கு 'உதவி' என்று சொல்லுங்கள்.",
        helpCommands: "குரல் கட்டளைகள்: 'அடுத்த பொருள்', 'தேர்ந்தெடு [பொருள்]', 'கார்ட்டில் சேர்', 'ரத்து செய்', 'கட்டணம் செலுத்த', 'பணத்தில் செலுத்த', 'அட்டையில் செலுத்த'.",
    }
};

// Store items
const storeItems = [
    { id: 'apple', name: { en: 'Apple', si: 'ඇපල්', ta: 'ஆப்பிள்' }, price: 2 },
    { id: 'bread', name: { en: 'Bread', si: 'පාන්', ta: 'ரொட்டி' }, price: 3 },
    { id: 'milk', name: { en: 'Milk', si: 'කිරි', ta: 'பால்' }, price: 4 },
    { id: 'banana', name: { en: 'Banana', si: 'කෙසෙල්', ta: 'வாழைப்பழம்' }, price: 1 },
    { id: 'rice', name: { en: 'Rice', si: 'සහල්', ta: 'அரிசி' }, price: 5 },
];

// Shopping list
const shoppingList = ['apple', 'bread', 'milk'];

const languageCodes = {
    en: 'en-US',
    si: 'si-LK',
    ta: 'ta-LK',
};

export default function ShoppingModuleGame({navigation,route}) {
    const [language, setLanguage] = useState('en');
    const [money, setMoney] = useState(10);
    const [cart, setCart] = useState([]);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [gameStage, setGameStage] = useState('intro'); // intro, shopping, checkout, payment, summary
    const [recognizing, setRecognizing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [animation, setAnimation] = useState(null);
    const [token,setToken] = useState(route.params?.token||'');


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
                speak(t.instructions);
                setGameStage('shopping');
            }, 2500);
            setTimeout(() => {
                speak(t.helpPrompt);
            }, 5000);
        };

        startGame();


        setAnimation(LOTTIE_ICONS.shoppingGame);

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
            speak(t.helpCommands);
            return;
        }

        // Process commands based on game stage
        switch(gameStage) {
            case 'shopping':
                if (command.includes(t.nextItem.toLowerCase())) {
                    navigateItems('next');
                } else if (command.includes(t.select.toLowerCase())) {
                    // Check if any store item name is in the command
                    const itemToSelect = storeItems.find(item =>
                        command.includes(item.name[language].toLowerCase())
                    );
                    if (itemToSelect) {
                        selectItem(itemToSelect);
                    }
                } else if (command.includes(t.add.toLowerCase())) {
                    confirmSelection();
                } else if (command.includes(t.cancel.toLowerCase())) {
                    cancelSelection();
                } else if (command.includes(t.checkout.toLowerCase())) {
                    goToCheckout();
                }
                break;

            case 'checkout':
                if (command.includes(t.cash.toLowerCase())) {
                    handlePayment('cash');
                } else if (command.includes(t.card.toLowerCase())) {
                    handlePayment('card');
                }
                break;

            default:
                break;
        }
    };

    // Navigation between items
    const navigateItems = (direction) => {
        if (direction === 'next') {
            const nextIndex = (currentItemIndex + 1) % storeItems.length;
            setCurrentItemIndex(nextIndex);
            const item = storeItems[nextIndex];
            speak(`${item.name[language]}, $${item.price}`);
        } else if (direction === 'prev') {
            const prevIndex = (currentItemIndex - 1 + storeItems.length) % storeItems.length;
            setCurrentItemIndex(prevIndex);
            const item = storeItems[prevIndex];
            speak(`${item.name[language]}, $${item.price}`);
        }
    };

    // Select an item
    const selectItem = (item) => {
        speak(`${t.itemSelected} ${item.name[language]}. ${t.cost} $${item.price}. ${t.addToCart}`);
    };

    // Confirm selection
    const confirmSelection = () => {
        const selectedItem = storeItems[currentItemIndex];

        // Check if there's enough money
        if (selectedItem.price > money) {
            speak(t.notEnoughMoney);
            return;
        }

        // Add to cart and update money
        setCart([...cart, selectedItem]);
        setMoney(money - selectedItem.price);
        speak(`${t.addedToCart} ${t.remainingBalance} $${money - selectedItem.price}.`);
    };

    // Cancel selection
    const cancelSelection = () => {
        speak(`${t.cancel}. ${t.remainingBalance} $${money}.`);
    };

    // Go to checkout
    const goToCheckout = () => {
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        setGameStage('checkout');
        speak(`${t.totalPrice} $${totalPrice}. ${t.paymentMethod}`);
    };

    // Handle payment
    const handlePayment = (method) => {
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        const change = money;

        if (method === 'cash') {
            speak(`${t.paidWithCash} $${change}.`);
        } else {
            speak(t.paidWithCard);
        }

        // Check if all required items were bought
        const boughtAllRequired = shoppingList.every(requiredItem =>
            cart.some(cartItem => cartItem.id === requiredItem)
        );

        setTimeout(() => {
            setGameStage('summary');
            if (boughtAllRequired) {
                speak(`${t.congratulations} ${t.summary} ${cart.map(item => item.name[language]).join(', ')} ${t.remaining} $${change} ${t.remaining2}`);
                updateGameProgress();
            } else {
                const missingItems = shoppingList.filter(requiredItem =>
                    !cart.some(cartItem => cartItem.id === requiredItem)
                );
                speak(`${t.summary} ${cart.map(item => item.name[language]).join(', ')}. ${t.remaining} $${change} ${t.remaining2} ${t.missingItems} ${missingItems.map(id => {
                    const item = storeItems.find(i => i.id === id);
                    return item ? item.name[language] : id;
                }).join(', ')}`);
            }
        }, 2000);
    };

    // Change language
    const changeLanguage = (lang) => {
        setLanguage(lang);
        // Announce language change
        setTimeout(() => {
            speak(translations[lang].welcome);
        }, 500);
    };

    // Restart game
    const restartGame = () => {
        setMoney(10);
        setCart([]);
        setCurrentItemIndex(0);
        setGameStage('intro');

        // Reinitialize game
        speak(t.welcome);
        setTimeout(() => {
            speak(t.instructions);
            setGameStage('shopping');
        }, 2500);
    };

    const calculateShoppingGameProgress = (cart, requiredItems, initialMoney, finalMoney) => {
        // Base calculations
        const requiredItemsCount = requiredItems.length;
        const boughtItemsCount = cart.filter(item => requiredItems.includes(item.id)).length;
        
        // Item completion score (max 50 points)
        const itemCompletionScore = (boughtItemsCount / requiredItemsCount) * 50;
        
        // Money management score (max 50 points)
        // Calculate how efficiently the player used their money
        const moneyEfficiencyScore = Math.min(
            50, 
            // Reward for spending less than initial amount
            ((initialMoney - finalMoney) / initialMoney) * 50
        );
        
        // Total progress (0-100)
        const totalProgress = Math.min(
            100, 
            itemCompletionScore + moneyEfficiencyScore
        );
        
        return Math.round(totalProgress);
    };

    const updateGameProgress = async () => {
        try {
            // Use the existing cart, initial money, and other details from component state
            const initialMoney = 10;
            const finalMoney = money;
            const requiredItems = shoppingList;
            
            // Calculate progress based on cart, initial money, final money, and required items
            const progressValue = calculateShoppingGameProgress(
                cart, 
                requiredItems, 
                initialMoney, 
                finalMoney
            );
            
            // Note: You'll need to handle token retrieval separately
            const token = await AsyncStorage.getItem('userToken'); // or however you're managing tokens
            
            // Make API call to update progress
            const response = await axios.put(
                'https://skill-share-281536e63f1e.herokuapp.com/api/progress/game-progress/shopping-game',
                { progressValue },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Shopping game progress updated:', response.data);
            
            return progressValue;
        } catch (error) {
            console.error('Error updating game progress:', error);
            
            Alert.alert(
                'Progress Update Failed',
                'Unable to save your game progress. Please check your internet connection.'
            );
            
            return null;
        }
    };
    

    // Render UI based on game stage
    const renderGameStage = () => {
        const currentItem = storeItems[currentItemIndex];

        switch(gameStage) {
            case 'intro':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={styles.title}>Smart Shopper</Text>
                        <Text style={styles.instructions}>{t.welcome}</Text>
                        <Text style={styles.instructions}>{t.instructions}</Text>
                    </View>
                );

            case 'shopping':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={styles.title}>Smart Shopper</Text>

                        <View style={styles.itemContainer}>
                            <Text style={styles.itemName}>{currentItem.name[language]}</Text>
                            <Text style={styles.itemPrice}>${currentItem.price}</Text>
                        </View>

                        <View style={styles.cartInfo}>
                            <Text style={styles.cartTitle}>{t.remainingBalance}: ${money}</Text>
                            <Text style={styles.cartItems}>
                                {cart.length > 0
                                    ? cart.map(item => item.name[language]).join(', ')
                                    : ''}
                            </Text>
                        </View>

                        <View style={styles.controlButtons}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigateItems('prev')}
                            >
                                <Text style={styles.buttonText}>◀ {t.previousItem}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigateItems('next')}
                            >
                                <Text style={styles.buttonText}>{t.nextItem} ▶</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => selectItem(currentItem)}
                            >
                                <Text style={styles.buttonText}>{t.select}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={confirmSelection}
                            >
                                <Text style={styles.buttonText}>{t.add}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={goToCheckout}
                            >
                                <Text style={styles.buttonText}>{t.checkout}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'checkout':
                const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
                return (
                    <View style={styles.stageContainer}>
                        <Text style={styles.title}>{t.checkout}</Text>

                        <View style={styles.summaryContainer}>
                            <Text style={styles.summaryText}>
                                {t.totalPrice}: ${totalPrice}
                            </Text>
                            <Text style={styles.summaryText}>
                                {t.remainingBalance}: ${money}
                            </Text>
                        </View>

                        <View style={styles.paymentOptions}>
                            <TouchableOpacity
                                style={styles.paymentButton}
                                onPress={() => handlePayment('cash')}
                            >
                                <Text style={styles.buttonText}>{t.cash}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.paymentButton}
                                onPress={() => handlePayment('card')}
                            >
                                <Text style={styles.buttonText}>{t.card}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'summary':
                return (
                    <View style={styles.stageContainer}>
                        <Text style={styles.title}>{t.congratulations}</Text>

                        <View style={styles.summaryContainer}>
                            <Text style={styles.summaryText}>
                                {t.summary}: {cart.map(item => item.name[language]).join(', ')}
                            </Text>
                            <Text style={styles.summaryText}>
                                {t.remaining} ${money} {t.remaining2}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.restartButton}
                            onPress={restartGame}
                        >
                            <Text style={styles.buttonText}>↺ Restart</Text>
                        </TouchableOpacity>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Language switcher */}
            <View style={styles.languageSwitcher}>
                <TouchableOpacity
                    style={[styles.langButton, language === 'en' ? styles.activeLang : null]}
                    onPress={() => changeLanguage('en')}
                >
                    <Text style={styles.langText}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.langButton, language === 'si' ? styles.activeLang : null]}
                    onPress={() => changeLanguage('si')}
                >
                    <Text style={styles.langText}>සිංහල</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.langButton, language === 'ta' ? styles.activeLang : null]}
                    onPress={() => changeLanguage('ta')}
                >
                    <Text style={styles.langText}>தமிழ்</Text>
                </TouchableOpacity>
            </View>

            {/* Central Lottie animation */}
            <View style={styles.animationContainer}>
                {animation && (
                    <LottieView
                        source={animation}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                )}
            </View>

            {/* Game content */}
            {renderGameStage()}

            {/* Voice commands */}
            <View style={styles.voiceContainer}>
                <TouchableOpacity
                    style={[styles.voiceButton, recognizing ? styles.listeningButton : null]}
                    onPress={startListening}
                >
                    <Text style={styles.voiceButtonText}>
                        {recognizing ? '🎤 Listening...' : '🎤 Speak'}
                    </Text>
                </TouchableOpacity>
                {transcript ? (
                    <Text style={styles.transcriptText}>{transcript}</Text>
                ) : null}
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

