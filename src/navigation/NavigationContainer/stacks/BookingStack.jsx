import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";
import { Booking } from "@screens/index";
import { renderSharedStackScreens } from "../sharedStackScreens";

const Stack = createNativeStackNavigator();

const BookingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={navigationStrings.BOOKING} component={Booking} />
    {renderSharedStackScreens(Stack)}
  </Stack.Navigator>
);

export default BookingStack;
