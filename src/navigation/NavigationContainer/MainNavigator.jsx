import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";
import BottomTabNavigator from "./BottomTabNavigator";
import {
  ActivityDetails,
  BrouseByCategory,
  CityDetail,
  SearchCity,
  CreateTrip,
} from "@screens/index";

const MainStack = createNativeStackNavigator();
const MainNavigator = () => {
  return (
    <>
      <MainStack.Navigator
        initialRouteName={navigationStrings.BOTTOM_TAB}
        screenOptions={{
          headerShown: false,
        }}
      >
        <MainStack.Screen
          name={navigationStrings.BOTTOM_TAB}
          component={BottomTabNavigator}
        />
        <MainStack.Screen
          name={navigationStrings.SEARCH_CITY}
          component={SearchCity}
        />
        <MainStack.Screen
          name={navigationStrings.CITY_DETAIL}
          component={CityDetail}
        />
        <MainStack.Screen
          name={navigationStrings.BROUSE_BY_CATEGORY}
          component={BrouseByCategory}
        />
        <MainStack.Screen
          name={navigationStrings.ACTIVITY_DETAILS}
          component={ActivityDetails}
        />
        <MainStack.Screen
          name={navigationStrings.CREATE_TRIP}
          component={CreateTrip}
        />
      </MainStack.Navigator>
    </>
  );
};

export default MainNavigator;
