import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";
import { ChooseRoleScreen, EmployerKyc, EnableLocation, EnableNotification, ForgotPasswordScreen, OnboardingScreen, OtpScreen, PhoneLoginScreen, PhoneSignupScreen, ProfileOverview, ProfileProfessionalTittle, ProfileSetup, ResetPasswordScreen, SignInScreen, SignUp, SplashScreen, UploadProfileImage, } from "@screens/index";

const Stack = createNativeStackNavigator();
const AuthNavigator = () => {
    return (
        <>
            <Stack.Navigator
                initialRouteName={navigationStrings.SPLASHSCREEN}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name={navigationStrings.SPLASHSCREEN} component={SplashScreen} />
                <Stack.Screen name={navigationStrings.ONBOARDINGSCREEN} component={OnboardingScreen} />
                <Stack.Screen name={navigationStrings.PHONELOGINSCREEN} component={PhoneLoginScreen} />
                <Stack.Screen name={navigationStrings.PHONESIGNUPSCREEN} component={PhoneSignupScreen} />
                <Stack.Screen name={navigationStrings.SIGNINSCREEN} component={SignInScreen} />
                <Stack.Screen name={navigationStrings.OTPSCREEN} component={OtpScreen} />
                <Stack.Screen name={navigationStrings.SIGNUP} component={SignUp} />
            </Stack.Navigator>
        </>
    );
};

export default AuthNavigator;
