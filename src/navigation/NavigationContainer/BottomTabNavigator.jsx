import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Text,
} from "react-native";
import {
  createBottomTabNavigator,
  BottomTabBarHeightCallbackContext,
} from "@react-navigation/bottom-tabs";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { TAB_BAR_HEIGHT } from "@navigation/constants/tabBar";
import {
  getHeight,
  getVertiPadding,
  getWidth,
  getFontSize,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import AccountStack from "./stacks/AccountStack";
import BookingStack from "./stacks/BookingStack";
import GroupStack from "./stacks/GroupStack";
import HomeStack from "./stacks/HomeStack";
import TripsStack from "./stacks/TripsStack";

const Tab = createBottomTabNavigator();

const { width } = Dimensions.get("window");
const slotWidth = width / 5;

const tabMeta = {
  [navigationStrings.HOME]: { icon: imagePath.HOME, label: "Home" },
  [navigationStrings.GROUP]: { icon: imagePath.GROUP, label: "Crews" },
  [navigationStrings.TRIPS]: { icon: imagePath.TRIP, label: "Trips" },
  [navigationStrings.BOOKING]: { icon: imagePath.BOOKING, label: "Booking" },
  [navigationStrings.ACCOUNT]: { icon: imagePath.ACCOUNT, label: "Profile" },
};

const CustomTabBar = ({ state, navigation }) => {
  const onHeightChange = React.useContext(BottomTabBarHeightCallbackContext);

  return (
    <View
      style={styles.tabBarContainer}
      onLayout={(event) => onHeightChange?.(event.nativeEvent.layout.height)}
      pointerEvents="box-none"
    >
      <View style={styles.barBackground} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const meta = tabMeta[route.name] || {};
          const isTrips = route.name === navigationStrings.TRIPS;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              return;
            }

            navigation.navigate(route.name, { screen: route.name });
          };

          if (isTrips) {
            return (
              <View key={route.name} style={styles.fabSlot} pointerEvents="box-none">
                <TouchableOpacity
                  style={[styles.fab, isFocused && styles.fabActive]}
                  onPress={onPress}
                  activeOpacity={0.85}
                >
                  <Image
                    source={imagePath.TRIP}
                    style={[
                      styles.fabIcon,
                      { tintColor: isFocused ? colors.black : colors.lightText },
                    ]}
                  />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.name}
              style={styles.tabButton}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Image
                source={meta.icon}
                style={[
                  styles.icon,
                  { tintColor: isFocused ? colors.black : colors.lightText },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.black : colors.lightText },
                ]}
              >
                {meta.label}
              </Text>
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
        tabBarStyle: styles.tabBarStyle,
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
  tabBarContainer: {
    width,
    height: TAB_BAR_HEIGHT,
    backgroundColor: "transparent",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 0,
    overflow: "visible",
  },
  barBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tabBarStyle: {
    height: TAB_BAR_HEIGHT,
    backgroundColor: "transparent",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    overflow: "visible",
  },
  tabRow: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    paddingBottom: getVertiPadding(8),
    backgroundColor: "transparent",
  },
  tabButton: {
    width: slotWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: getWidth(22),
    height: getHeight(22),
    resizeMode: "contain",
    marginBottom: getHeight(2),
  },
  label: {
    fontSize: getFontSize(10),
    fontFamily: fonts.RobotoMedium,
  },
  fabSlot: {
    width: slotWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: getWidth(52),
    height: getWidth(52),
    borderRadius: getWidth(26),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -getHeight(16),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fabActive: {
    borderColor: colors.black,
  },
  fabIcon: {
    width: getWidth(22),
    height: getHeight(22),
    resizeMode: "contain",
  },
});
