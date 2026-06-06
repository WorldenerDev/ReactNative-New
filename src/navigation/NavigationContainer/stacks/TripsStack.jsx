import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";
import { Trips } from "@screens/index";
import { renderSharedStackScreens } from "../sharedStackScreens";

const Stack = createNativeStackNavigator();

const TripsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={navigationStrings.TRIPS} component={Trips} />
    {renderSharedStackScreens(Stack)}
  </Stack.Navigator>
);

export default TripsStack;
