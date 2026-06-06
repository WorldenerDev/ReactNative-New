import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";
import { Home } from "@screens/index";
import { renderSharedStackScreens } from "../sharedStackScreens";

const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={navigationStrings.HOME} component={Home} />
    {renderSharedStackScreens(Stack)}
  </Stack.Navigator>
);

export default HomeStack;
