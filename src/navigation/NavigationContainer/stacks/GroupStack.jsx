import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";
import { Group } from "@screens/index";
import { renderSharedStackScreens } from "../sharedStackScreens";

const Stack = createNativeStackNavigator();

const GroupStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={navigationStrings.GROUP} component={Group} />
    {renderSharedStackScreens(Stack)}
  </Stack.Navigator>
);

export default GroupStack;
