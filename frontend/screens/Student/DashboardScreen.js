import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Dimensions, Platform, StatusBar,Image,
} from 'react-native';
import Swiper from 'react-native-swiper';
import {achievementData, userProfile} from '../../mockData';
import SkillModules from '../../components/SkillModules';
import { AchievementBadge } from "../../components/AchievementBadge";
import { WeeklyChallenge } from "../../components/WeeklyChallange";
import Footer from "../../components/Footer";
import SkillGames from "../../components/SkillGames";

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                accessibilityLabel="Dashboard scroll view"
            >
                {/* Weekly Challenge Swiper */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Challenges</Text>
                    <Swiper
                        showsButtons={false}
                        showsPagination={false}
                        loop
                        autoplay
                        autoplayTimeout={20}
                        style={styles.swiper}
                    >
                        <WeeklyChallenge />
                        <WeeklyChallenge />
                    </Swiper>
                </View>

                {/* Skill Modules Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Your Skill Modules</Text>
                    <SkillModules
                        onModulePress={(route) =>
                            navigation.navigate('Skill Modules', {
                                screen: route
                            })
                        }
                    />
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Your Skill Games</Text>
                    <SkillGames onModulePress={(route) =>
                        navigation.navigate('Skill Games', {
                            screen: route
                        })
                    } />
                </View>

                {/* Achievements Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Recent Achievements</Text>
                    <View style={styles.achievementsContainer}>
                        {achievementData.map((achievement, index) => (
                            <AchievementBadge
                                key={index}
                                icon={achievement.icon}
                                title={achievement.title}
                                description={achievement.description}
                            />
                        ))}
                    </View>
                </View>
                <Footer/>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    progressSummary: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
    sectionContainer: {
        paddingVertical: 2,
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily:'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 10,
    },
    weeklyChallengeContainer: {
        backgroundColor: '#E6F2FF',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#005A9C',
    },
    completedChallenge: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    challengeTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#005A9C',
        marginLeft: 10,
    },
    challengeDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    challengeProgress: {
        alignItems: 'flex-end',
    },
    challengeProgressText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#005A9C',
    },
    achievementsContainer: {
        flexDirection: 'column',
    },
    achievementBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    achievementContent: {
        marginLeft: 15,
        flex: 1,
    },
    achievementTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    achievementDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },

    swiper: {
        height: 150,
    },
});

export default DashboardScreen;
