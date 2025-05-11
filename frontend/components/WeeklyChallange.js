import React, {useState} from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {TouchableOpacity,View,Text,StyleSheet} from "react-native";


export const WeeklyChallenge = () => {
    const [isCompleted, setIsCompleted] = useState(false);

    return (
        <TouchableOpacity
            style={[
                styles.weeklyChallengeContainer,
                isCompleted && styles.completedChallenge
            ]}
            onPress={() => setIsCompleted(!isCompleted)}
            accessibilityLabel="Weekly Challenge: Complete three street crossing simulations"
        >
            <View style={styles.challengeHeader}>
                <MaterialIcons
                    name="stars"
                    size={24}
                    color={isCompleted ? "#4CAF50" : "#005A9C"}
                />
                <Text style={styles.challengeTitle}>Weekly Challenge</Text>
            </View>
            <Text style={styles.challengeDescription}>
                Complete 3 street crossing simulations
            </Text>
            <View style={styles.challengeProgress}>
                <Text style={styles.challengeProgressText}>
                    {isCompleted ? "Completed" : "In Progress"}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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
        fontFamily: 'Montserrat_500Medium',
    },
    challengeDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        fontFamily: 'Montserrat_400Regular',
    },
    challengeProgress: {
        alignItems: 'flex-end',
    },
    challengeProgressText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#005A9C',
        fontFamily: 'Montserrat_500Medium',
    },
})