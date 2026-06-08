import navigationStrings from "@navigation/navigationStrings";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "./BottomTabNavigator";
import { renderRootStackScreens } from "./rootStackScreens";

const MainStack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <MainStack.Navigator
      initialRouteName={navigationStrings.BOTTOM_TAB}
      screenOptions={{
        headerShown: false,
      }}
    >
      {renderRootStackScreens(MainStack, BottomTabNavigator)}
    </MainStack.Navigator>
  );
};

export default MainNavigator;
