import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Layout from '../layout/Layout';
import { Home, Users, Settings2 } from "lucide-react-native";
import Dashboard from "../screens/Guardian/Dashboard";
import Students from "../screens/Guardian/Students";
import Settings from "../screens/Guardian/Settings";
import StudentDetails from "../screens/Guardian/StudentDetails";

// Create stack navigator for Students section
const StudentsStack = createNativeStackNavigator();
const StudentsStackNavigator = () => {
    return (
        <StudentsStack.Navigator screenOptions={{ headerShown: false }}>
            <StudentsStack.Screen name="StudentsList" component={Students} />
            <StudentsStack.Screen name="StudentDetails" component={StudentDetails} />
        </StudentsStack.Navigator>
    );
};

const BottomTabNavigator = createBottomTabNavigator();
const GuardianNavigator = () => {
    return (
        <Layout>
            <BottomTabNavigator.Navigator
                initialRouteName="Dashboard"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let IconComponent;
                        if (route.name === 'Dashboard') {
                            IconComponent = Home;
                        } else if (route.name === 'Students') {
                            IconComponent = Users;
                        } else if (route.name === 'Settings') {
                            IconComponent = Settings2;
                        }
                        return <IconComponent color={color} size={size} />;
                    },
                    tabBarActiveTintColor: '#2e86de',
                    tabBarInactiveTintColor: 'gray',
                    headerShown: false,
                })}
            >
                <BottomTabNavigator.Screen name='Dashboard' component={Dashboard} />
                {/* Replace the direct Students component with the StudentsStackNavigator */}
                <BottomTabNavigator.Screen name='Students' component={StudentsStackNavigator} />
                <BottomTabNavigator.Screen name='Settings' component={Settings} />
            </BottomTabNavigator.Navigator>
        </Layout>
    );
};

export default GuardianNavigator;