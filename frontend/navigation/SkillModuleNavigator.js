import {createStackNavigator} from '@react-navigation/stack';
import SkillModuleScreen from "../screens/Student/SkillModuleScreen";
import ShoppingModuleScreen from "../screens/Student/Skill-Module-Screen/ShoppingModule";
import PublicTransportModuleScreen from "../screens/Student/Skill-Module-Screen/PublicTransport";
import CrossingStreet from "../screens/Student/Skill-Module-Screen/CrossingStreet";

const SkillModuleStack = createStackNavigator();

const SkillModuleNavigator = () => {
    return(
        <SkillModuleStack.Navigator screenOptions={{headerShown:false}}>
            <SkillModuleStack.Screen name = 'SkillModuleMain' component={SkillModuleScreen}/>
            <SkillModuleStack.Screen name = 'StreetCrossingModule' component={CrossingStreet}/>
            <SkillModuleStack.Screen name = 'ShoppingModule' component={ShoppingModuleScreen}/>
            <SkillModuleStack.Screen name = 'PublicTransportModule' component={PublicTransportModuleScreen}/>
        </SkillModuleStack.Navigator>
    )
}

export default SkillModuleNavigator;