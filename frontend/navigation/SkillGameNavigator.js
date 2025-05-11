import {createStackNavigator} from "@react-navigation/stack";
import CrossingStreetGame from "../screens/Student/Skill-Module-Game/CrossingStreetGame";
import SkillGamesScreen from "../screens/Student/SkillGamesScreen";
import ShoppingModuleGame from "../screens/Student/Skill-Module-Game/ShoppingModuleGame";
import PublicTransport from "../screens/Student/Skill-Module-Screen/PublicTransport";
import SmartTravelerGame from "../screens/Student/Skill-Module-Game/PublicTransportGame";

const SkillGameStack = createStackNavigator();

const SkillGameNavigator = () => {
    return(
        <SkillGameStack.Navigator screenOptions={{headerShown:false}}>
            <SkillGameStack.Screen name='SkillGameMain' component={SkillGamesScreen}/>
            <SkillGameStack.Screen name="StreetCrossingGame" component={CrossingStreetGame}/>
            <SkillGameStack.Screen name='ShoppingGame' component={ShoppingModuleGame}/>
            <SkillGameStack.Screen name='PublicTransportGame' component={SmartTravelerGame}/>
        </SkillGameStack.Navigator>
    )
}
export default SkillGameNavigator