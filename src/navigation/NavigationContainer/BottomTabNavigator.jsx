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
import {
  getHeight,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import { Account, Booking, Group, Home, Trips } from "@screens/index";

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
    <View style={{ width, height: 70, backgroundColor: colors.white }}>
      <Svg width={width} height={70} style={StyleSheet.absoluteFill}>
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
            V70
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
      initialRouteName="Home"
      detachInactiveScreens={false}
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name={navigationStrings.HOME} component={Home} />
      <Tab.Screen name={navigationStrings.GROUP} component={Group} />
      <Tab.Screen name={navigationStrings.TRIPS} component={Trips} />
      <Tab.Screen name={navigationStrings.BOOKING} component={Booking} />
      <Tab.Screen name={navigationStrings.ACCOUNT} component={Account} />
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
