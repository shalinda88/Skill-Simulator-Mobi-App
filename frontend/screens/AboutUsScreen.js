import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { ChevronRight, Shield, Target, Heart, Globe, Users, Trophy,CreditCard } from 'lucide-react-native';

const AboutUsScreen = () => {
    const valueCards = [
        {
            icon: <Shield color="#4A90E2" size={40} />,
            title: 'Empowerment',
            description: 'Providing tools that build confidence and independence'
        },
        {
            icon: <Target color="#50C878" size={40} />,
            title: 'Accessibility',
            description: 'Innovative solutions tailored for visually impaired learners'
        },
        {
            icon: <Heart color="#FF6B6B" size={40} />,
            title: 'Compassion',
            description: 'A community-driven approach with genuine care'
        }
    ];

    const  handleJoinCommunity = () => {
        console.log('Join Community');
    };

    const handleDonate = () =>{
        console.log('Donate');
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <Image
                    source={require('../assets/mission-image.jpg')}
                    style={styles.headerImage}
                    resizeMode="cover"
                />
                <View style={styles.missionOverlay}>
                </View>
            </View>

            {/* Mission Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Our Mission</Text>
                <Text style={styles.sectionDescription}>
                    At SkillQuest, we are transforming educational experiences for visually impaired students.
                    Our platform bridges gaps in learning, providing interactive tools that build confidence,
                    independence, and essential life skills.
                </Text>
            </View>

            {/* Values Section */}
            <View style={styles.valuesContainer}>
                <Text style={styles.sectionTitle}>Our Core Values</Text>
                <View style={styles.valueCardsContainer}>
                    {/* First row with 2 cards */}
                    <View style={styles.valueCardRow}>
                        {valueCards.slice(0, 2).map((card, index) => (
                            <View key={index} style={styles.valueCard}>
                                <View style={styles.valueCardIcon}>{card.icon}</View>
                                <Text style={styles.valueCardTitle}>{card.title}</Text>
                                <Text style={styles.valueCardDescription}>
                                    {card.description}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {/* Second row with centered third card */}
                    <View style={styles.valueCardRowCentered}>
                        <View style={[styles.valueCard, styles.centeredValueCard]}>
                            <View style={styles.valueCardIcon}>{valueCards[2].icon}</View>
                            <Text style={styles.valueCardTitle}>{valueCards[2].title}</Text>
                            <Text style={styles.valueCardDescription}>
                                {valueCards[2].description}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Team Section */}
            <View style={styles.teamSection}>
                <View style={styles.teamMemberContainer}>
                    <Image
                        source={require('../assets/team-member1.jpg')}
                        style={styles.teamMemberImage}
                    />
                </View>
                <Text style={styles.ctaTitle}>Join Our Mission</Text>
                <Text style={styles.ctaSubtitle}>Help us create a world of equal opportunities</Text>

                {/* Buttons */}
                <TouchableOpacity style={styles.button} onPress={handleJoinCommunity}>
                    <Users color="#FFFFFF" size={20} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Join Our Community</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.donateButton]} onPress={handleDonate}>
                    <CreditCard color="#FFFFFF" size={20} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Donate via PayPal</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        height: Dimensions.get('window').height * 0.35,
        position: 'relative',
    },
    headerImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    headerTitle: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        color: 'white',
        fontSize: 16,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 25,
        backgroundColor: '#F9F9F9',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
        fontFamily:'Montserrat_700Bold',
    },
    sectionDescription: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        textAlign: 'center',
        fontFamily:'Montserrat_500Medium'
    },
    valuesContainer: {
        paddingVertical: 25,
        paddingHorizontal: 15,
    },
    valueCardsContainer: {
        // Adjusted for two layouts
    },
    valueCardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    valueCardRowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    valueCard: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20 ,
        padding: 15,
        marginHorizontal: 5 ,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    centeredValueCard: {
        width: '50%',
    },
    valueCardIcon: {
        marginBottom: 10,
    },
    valueCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
        fontFamily:'Montserrat_700Bold',
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
    valueCardDescription: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontFamily:'Montserrat_400Regular',
    },
    teamSection: {
        paddingVertical: 25,
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    teamMemberContainer: {
        marginBottom: 20,
    },
    teamMemberImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    ctaTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        fontFamily:'Montserrat_700Bold',
    },
    ctaSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontFamily:'Montserrat_500Medium',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginVertical: 10,
        width: '80%',
        alignSelf: 'center',
    },
    donateButton: {
        backgroundColor: '#FF6B6B',
    },
    buttonIcon: {
        marginRight: 10, // Spacing between icon and text
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Montserrat_700Bold',
    },
});

export default AboutUsScreen;