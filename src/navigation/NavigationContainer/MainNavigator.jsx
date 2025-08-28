import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "@navigation/navigationStrings";

const MainStack = createNativeStackNavigator();
const MainNavigator = () => {
    return (
        <>
            <MainStack.Navigator
                initialRouteName={navigationStrings.FREELANCER_TAB}
                screenOptions={{
                    headerShown: false,
                }}
            >
                {/* <MainStack.Screen name={navigationStrings.FREELANCER_TAB} component={FreelancerTab} /> */}

            </MainStack.Navigator>
        </>
    );
};

export default MainNavigator;
