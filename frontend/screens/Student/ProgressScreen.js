import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView, SafeAreaView
} from 'react-native';
import Swiper from "react-native-swiper";
import {achievementData, userProfile} from '../../mockData';
import {WeeklyChallenge} from "../../components/WeeklyChallange";
import {AchievementBadge} from "../../components/AchievementBadge";

const ProgressScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}
                        accessibilityLabel='Progress scroll view'>
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
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Skill Progress</Text>
                    {userProfile.skillProgress.map((skill, index) => (
                        <View key={index} style={styles.skillProgressCard}>
                            <Text style={styles.skillName}>{skill.name}</Text>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${skill.progress}%`,
                                            backgroundColor: skill.progress > 50 ? '#4CAF50' : '#FFC107'
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>{skill.progress}% Complete</Text>
                            <View style={styles.detailsContainer}>
                                <Text style={styles.detailText}>
                                    Last Practice: {skill.lastPractice}
                                </Text>
                                <Text style={styles.detailText}>
                                    Best Score: {skill.bestScore}%
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Skill Games Progress</Text>
                    {userProfile.skillProgress.map((skill, index) => (
                        <View key={index} style={styles.skillProgressCard}>
                            <Text style={styles.skillName}>{skill.name}</Text>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${skill.progress}%`,
                                            backgroundColor: skill.progress > 50 ? '#4CAF50' : '#FFC107'
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>{skill.progress}% Complete</Text>
                            <View style={styles.detailsContainer}>
                                <Text style={styles.detailText}>
                                    Last Practice: {skill.lastPractice}
                                </Text>
                                <Text style={styles.detailText}>
                                    Best Score: {skill.bestScore}%
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily:'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 10,
    },
    sectionContainer: {
        paddingVertical: 2,
        paddingHorizontal: 15,
    },
    skillProgressCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    skillName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 5
    },
    progressBar: {
        height: '100%'
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'right'
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    detailText: {
        fontSize: 12,
        color: '#999'
    }
});

export default ProgressScreen;