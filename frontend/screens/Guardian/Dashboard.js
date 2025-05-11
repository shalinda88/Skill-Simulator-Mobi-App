import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    FlatList,
    StatusBar,
    StyleSheet,
    Alert
} from "react-native";
import { COLORS } from "../../constants/Color";
import {LineChart} from 'react-native-chart-kit';
import {
    User,BarChart,Clock,Award,FileText,Settings,Home,PlusCircle,BookOpen
} from "lucide-react-native";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function Dashboard() {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [userName, setUserName] = useState('');
    const [students,setStudents] = useState([]);
    const [studentProgress,setStudentProgress] = useState(null);
    const [recentActivities,setRecentActivities] = useState([]);
    const [isLoading,setIsLoading] = useState(true);



    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const user = JSON.parse(userData);
                    setUserName(user.fullName); // Assuming the user object has a `name` field


                    const response = await axios.get(`https://skill-share-281536e63f1e.herokuapp.com/api/users/teacher-students/${user.id}`);
                    setStudents(response.data.data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                Alert.alert('Error', 'Failed to fetch students');
                setIsLoading(false);

            }
        };

        fetchUserData();
    }, []);


    useEffect(() => {
        fetchStudentProgress();
    }, [selectedStudent]);

    const fetchStudentProgress = async () => {
        if (selectedStudent){
            try {
                const token = await AsyncStorage.getItem('userToken')
                const progressResponse = await axios.get(`https://skill-share-281536e63f1e.herokuapp.com/api/progress/${selectedStudent._id}`,{
                    headers:{
                        'Authorization':`Bearer ${token}`
                    }
                });
                setStudentProgress(progressResponse.data);

            }catch (error){
                console.error('Error fetching student progress:',error);
            }
        }
    }


    const calculateAge = (dob) => {
        if (!dob) return 'N/A'; // Handle missing DOB
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();

        // Adjust if the birthday hasn't occurred yet this year
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.greeting}>Welcome, {userName ? `Teacher ${userName}` : 'Teacher'}</Text>
            <Text style={styles.subtitle}>Student Overview</Text>

            {/* Student Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentCards}>
                {students.map((student) => (
                    <TouchableOpacity
                        key={student._id}
                        style={[
                            styles.studentCard,
                            selectedStudent?._id === student._id && styles.selectedStudentCard
                        ]}
                        onPress={() => setSelectedStudent(student)}
                        accessibilityLabel={`${student.fullName}, ${calculateAge(student.dob)} years old`}
                        accessibilityRole="button"
                    >
                        <View style={styles.studentAvatar}>
                            <Text style={styles.avatarText}>{student.fullName.charAt(0)}</Text>
                        </View>
                        <Text style={styles.studentName}>{student.fullName}</Text>
                        <Text style={styles.studentDetails}>Age: {calculateAge(student.dob)} years old</Text>
                    </TouchableOpacity>
                ))}

            </ScrollView>

            {/* Skill Mastery */}
            {studentProgress && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Skill Mastery</Text>
                    <Text style={styles.cardSubtitle}>Overall Progress: {studentProgress.overallProgress}%</Text>

                    {Object.entries(studentProgress.progress).map(([skill, progress]) => (
                        <View key={skill} style={styles.skillItem}>
                            <Text style={styles.skillName}>{skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                            <View style={styles.skillProgressContainer}>
                                <View
                                    style={[styles.skillProgress, {width: `${progress}%`}]}
                                    accessibilityLabel={`${skill} mastery ${progress}%`}
                                />
                            </View>
                            <Text style={styles.skillPercent}>{progress}%</Text>
                        </View>
                    ))}

                    <Text style={styles.cardTitle}>Skill Games Mastery</Text>
                    {Object.entries(studentProgress.skillGames).map(([skill, progress]) => (
                        <View key={skill} style={styles.skillItem}>
                            <Text style={styles.skillName}>{skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                            <View style={styles.skillProgressContainer}>
                                <View
                                    style={[styles.skillProgress, {width: `${progress}%`}]}
                                    accessibilityLabel={`${skill} mastery ${progress}%`}
                                />
                            </View>
                            <Text style={styles.skillPercent}>{progress}%</Text>
                        </View>
                    ))}
                </View>








            )}



        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container:{
       flex:1,
       padding:16,
       paddingBottom:70,
        backgroundColor:COLORS.BACKGROUND,
    },
    greeting:{
        fontSize:21,
        fontWeight:'600',
        color:'#111',
        fontFamily:'Montserrat_600SemiBold',
        marginBottom:8
    },
    subtitle:{
        fontSize:18,
        fontWeight:'600',
        color:'#111',
        fontFamily:'Montserrat_400Regular',
    },
    studentCards:{
        marginTop:20,
        flexDirection:'row',
        marginBottom:30
    },
    studentCard:{
        width:150,
        backgroundColor:COLORS.BACKGROUND,
        borderRadius:12,
        padding:20,
        marginRight:12,
        marginBottom:15,
        shadowColor:'#000',
        shadowOffset: {width:0,height:1},
        shadowOpacity:0.1,
        shadowRadius:4,
        elevation:2,
    },
    chartAccessibilityDesc:{
      fontSize:12,
        textAlign:'center',
      fontFamily:'Montserrat_400Regular'
    },
    selectedStudentCard:{
        borderWidth:2,
        borderColor:'#4A6FA5',
    },
    addStudentCard:{
        width:150,
        backgroundColor:'#fff',
        borderRadius:12,
        padding:20,
        marginRight:12,
        shadowColor:'#000',
        shadowOffset:{width:0,height:1},
        shadowOpacity:0.1,
        shadowRadius:4,
        elevation:2,
        justifyContent:'center',
        alignItems:'center',
        borderStyle:'dashed',
        borderWidth:1,
        borderColor:'#4A6FA5'
    },
    addStudentText:{
        color:'#4A6FA5',
        fontWeight:'500',
        fontFamily:'Montserrat_400Regular',
    },
    studentAvatar:{
        width:40,
        height:40,
        borderRadius:20,
        backgroundColor:'#4A6FA5',
        justifyContent:'center',
        alignItems:'center',
        marginBottom:12,
    },
    avatarText:{
        color:'#fff',
        fontSize:18,
        fontFamily:'Montserrat_600Regular',
    },
    studentName:{
        fontSize:16,
        color:'#333',
        marginBottom:4,
        fontFamily:'Montserrat_400Regular',
    },
    studentDetails:{
        fontSize:14,
        color:'#666',
        fontFamily:'Montserrat_400Regular',
        marginBottom:4,
    },
    progressBar:{
        height:6,
        backgroundColor:'#E0E0E0',
        borderRadius:3,
        marginVertical:8,
        overflow:'hidden',
    },
    progressFill:{
        height:'100%',
        backgroundColor:'#4A6FA5',
        borderRadius:3,
    },
    card:{
        backgroundColor:'#fff',
        borderRadius:12,
        padding:16,
        marginBottom:20,
        shadowColor:'#000',
        shadowOffset:{width:0,height:1},
        shadowOpacity:0.1,
        shadowRadius:4,
        elevation:2,
    },
    cardTitle:{
        fontSize:18,
        fontFamily:'Montserrat_600SemiBold',
        color:'#333',
        marginBottom:10
    },
    cardSubtitle:{
        fontSize:14,
        fontFamily:'Montserrat_400Regular',
        color:'#666',
        marginBottom:16
    },
    chart:{
        borderRadius:8,
        marginBottom:8,
    },
    skillItem:{
        flexDirection:'row',
        alignItems:'center',
        marginBottom:12
    },
    skillName:{
        width:'30%',
        fontSize:14,
        color:'#333',
        fontFamily:'Montserrat_400Regular',
    },
    skillProgressContainer:{
        flex:1,
        height:8,
        backgroundColor:'#E0E0E0',
        borderRadius:4,
        marginRight:12,
        overflow:'hidden',
    },
    skillProgress:{
        height:'100%',
        backgroundColor:'#5E9A8E',
        borderRadius:4,
    },
    skillPercent:{
        width: '10%',
        fontSize: 14,
        color: '#5E9A8E',
        fontWeight: '600',
        textAlign: 'right',
        fontFamily:'Montserrat_600SemiBold'
    },
    activityItem:{
        flexDirection:'row',
        marginBottom:16,
    },
    activityIcon:{
        width:36,
        height:36,
        borderRadius:18,
        backgroundColor:'#4A6FA5',
        justifyContent:'center',
        alignItems:'center',
        marginRight:12,
    },
    activityContent:{
        flex:1
    },
    activityTitle:{
        fontSize:16,
        color:'#333',
        marginBottom:5,
        fontFamily:'Montserrat_600SemiBold'
    },
    activityDetail:{
        fontSize:14,
        color:'#666',
        fontFamily:'Montserrat_400Regular',
        marginBottom:2,
    },
    activityTime:{
        fontSize:12,
        color:'#888',
        fontFamily:'Montserrat_400Regular',
    },
    viewAllButton:{
        alignSelf:'center',
        marginTop:8,
        paddingVertical:8,
    },
    viewAllButtonText:{
        color:'#4A6FA5',
        fontWeight:'600',
        fontFamily:'Montserrat_400Regular'
    }

})