import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Dimensions, ScrollView} from 'react-native';
import Swiper from 'react-native-swiper';
import { Accessibility, Play, Info } from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
    const appFeatures = [
        {
            id: 'audio-guidance',
            title: 'Audio-Guided Learning',
            description: 'Comprehensive audio simulations for skill development',
            icon: <Accessibility color="#4A90E2" size={36} />,
        },
        {
            id: 'interactive-scenarios',
            title: 'Interactive Scenarios',
            description: 'Real-world skill practice in a safe, controlled environment',
            icon: <Play color="#50C878" size={36} />,
        },
        {
            id: 'progress-tracking',
            title: 'Progress Tracking',
            description: 'Monitor skill development and personal growth',
            icon: <Info color="#FF6B6B" size={36} />,
        },
    ];

    const renderFeature = (feature) => (
        <View key={feature.id} style={styles.featureCard}>
            <View style={styles.featureIconContainer}>{feature.icon}</View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Swiper for Images without Circle Navigation */}
            <View style={styles.imageSwiperContainer}>
                <Swiper
                    loop={true}
                    autoplay={true}
                    showsPagination={false} // Disable circle navigation
                    showsButtons={false}     // Disable left-right buttons
                    autoplayTimeout={3}
                >
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../assets/app-intro-image.webp')}
                            style={styles.missionImage}
                            resizeMode="cover"
                        />
                        <View style={styles.missionOverlay}>
                            <Text style={styles.appName}>Skill Quest</Text>
                            <Text style={styles.appSubtitle}>Audio-Guided Skills for Independence</Text>
                        </View>
                    </View>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../assets/app-intro-image2.webp')}
                            style={styles.missionImage}
                            resizeMode="cover"
                        />
                        <View style={styles.missionOverlay}>
                            <Text style={styles.appName} >Skill Quest</Text>
                            <Text style={styles.appSubtitle}>Audio-Guided Skills for Independence</Text>
                        </View>
                    </View>


                </Swiper>
            </View>

            {/* Features: Two per row, with third centered in the next row */}
            <View style={styles.featuresContainer}>
                {/* First Row with Two Features */}
                <View style={styles.featureRow}>
                    {renderFeature(appFeatures[0])}
                    {renderFeature(appFeatures[1])}
                </View>

                {/* Second Row with One Centered Feature */}
                <View style={styles.featureRowCentered}>
                    {renderFeature(appFeatures[2])}
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.learnMoreButton]}
                    onPress={() => navigation.navigate('About')}
                >
                    <Text style={styles.buttonText}>Learn More</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.loginButton]}
                    onPress={()=>navigation.navigate('Auth',{
                        screen:'Login'
                    })}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    imageSwiperContainer: {
        height: Dimensions.get('window').height * 0.45,
        position: 'relative',
    },
    imageContainer:{
      flex:1,
      position:'relative',
    },
    missionImage: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    missionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        width:'100%',
        fontSize: 88,
        color: 'white',
        textAlign:'center',
        marginBottom: 5,
        fontFamily:'Ephesis_400Regular'
    },
    appSubtitle: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        fontFamily:'Montserrat_700Bold',
    },
    featuresContainer: {
        flex: 1,
        marginVertical: 20,
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    featureRowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    featureCard: {
        width: '45%',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20 ,
        padding: 15,
        marginHorizontal: 7,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    featureIconContainer: {
        marginBottom: 10,

    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
        fontFamily:'Montserrat_700Bold',
    },
    featureDescription: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontFamily:'Montserrat_400Regular',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    learnMoreButton: {
        backgroundColor: '#4A90E2',
    },
    loginButton: {
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Montserrat_700Bold',
    },
    loginButtonText:{
        color:'#4A90E2',
        fontWeight: 'bold',
        fontFamily:'Montserrat_700Bold',
        fontSize:18
    }
});

export default HomeScreen;
