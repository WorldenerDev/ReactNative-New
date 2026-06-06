import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";
import { Account } from "@screens/index";
import { renderSharedStackScreens } from "../sharedStackScreens";

const Stack = createNativeStackNavigator();

const AccountStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={navigationStrings.ACCOUNT} component={Account} />
    {renderSharedStackScreens(Stack)}
  </Stack.Navigator>
);

export default AccountStack;
