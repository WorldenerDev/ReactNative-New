import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";
import {
  Interests,
  Notification,
  OnboardingScreen,
  OtpScreen,
  SignInScreen,
  SignUp,
  SignUpScreen,
  SplashScreen,
} from "@screens/index";

const Stack = createNativeStackNavigator();
const AuthNavigator = () => {
  return (
    <>
      <Stack.Navigator
        initialRouteName={navigationStrings.INTERESTS}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name={navigationStrings.SPLASHSCREEN}
          component={SplashScreen}
        />
        <Stack.Screen
          name={navigationStrings.ONBOARDINGSCREEN}
          component={OnboardingScreen}
        />
        <Stack.Screen
          name={navigationStrings.ENABLENOTIFICATIONSCREEN}
          component={Notification}
        />
        <Stack.Screen
          name={navigationStrings.SIGNINSCREEN}
          component={SignInScreen}
        />
        <Stack.Screen
          name={navigationStrings.SIGNUPSCREEN}
          component={SignUp}
        />
        <Stack.Screen
          name={navigationStrings.OTPSCREEN}
          component={OtpScreen}
        />
        <Stack.Screen
          name={navigationStrings.INTERESTS}
          component={Interests}
        />
      </Stack.Navigator>
    </>
  );
};

export default AuthNavigator;
