import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Svg, { Path } from "react-native-svg";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import { TAB_BAR_HEIGHT } from "@navigation/constants/tabBar";
import {
  getHeight,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import AccountStack from "./stacks/AccountStack";
import BookingStack from "./stacks/BookingStack";
import GroupStack from "./stacks/GroupStack";
import HomeStack from "./stacks/HomeStack";
import TripsStack from "./stacks/TripsStack";

const Tab = createBottomTabNavigator();

const { width } = Dimensions.get("window");
const tabWidth = width / 5;

const tabIcons = {
  Home: imagePath.HOME,
  Group: imagePath.GROUP,
  Trips: imagePath.TRIP,
  Booking: imagePath.BOOKING,
  Account: imagePath.ACCOUNT,
};

const CustomTabBar = ({ state, navigation }) => {
  const activeIndex = state.index;
  const activeX = tabWidth * activeIndex;

  return (
    <View style={{ width, height: TAB_BAR_HEIGHT, backgroundColor: colors.white }}>
      <Svg width={width} height={TAB_BAR_HEIGHT} style={StyleSheet.absoluteFill}>
        <Path
          fill={colors.secondary}
          d={`
            M0 0
            H${activeX}
            C${activeX + tabWidth * 0.25} 0, ${activeX + tabWidth * 0.25} 0, ${activeX + tabWidth / 2
            } 10
            C${activeX + tabWidth * 0.75} 0, ${activeX + tabWidth * 0.75} 0, ${activeX + tabWidth
            } 0
            H${width}
            V${TAB_BAR_HEIGHT}
            H0
            Z
          `}
        />
      </Svg>

      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            if (!isFocused) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.name}
              style={styles.tabButton}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Image
                source={tabIcons[route.name]}
                style={[
                  styles.icon,
                  { tintColor: isFocused ? colors.white : colors.primary },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={navigationStrings.HOME}
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: TAB_BAR_HEIGHT },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name={navigationStrings.HOME} component={HomeStack} />
      <Tab.Screen name={navigationStrings.GROUP} component={GroupStack} />
      <Tab.Screen name={navigationStrings.TRIPS} component={TripsStack} />
      <Tab.Screen name={navigationStrings.BOOKING} component={BookingStack} />
      <Tab.Screen name={navigationStrings.ACCOUNT} component={AccountStack} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    height: getHeight(65),
    backgroundColor: "transparent",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: getVertiPadding(6),
  },
  icon: {
    width: getWidth(24),
    height: getHeight(24),
    resizeMode: "contain",
  },
});
