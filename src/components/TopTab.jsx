import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "@assets/colors";
import { getWidth, getHeight, getRadius, getFontSize } from "@utils/responsive";
import fonts from "@assets/fonts";

const TopTab = ({
  tabs = ["All", "Upcoming", "Past", "Cancelled"],
  activeTab,
  onTabChange,
  containerStyle,
}) => {
  const handleTabPress = (tab) => {
    onTabChange?.(tab);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && {
              backgroundColor: colors.secondary,
            },
          ]}
          onPress={() => handleTabPress(tab)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              {
                fontSize: getFontSize(12),
                fontFamily: fonts.RobotoMedium,
                color: colors.primary,
              },
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: getRadius(12),
    padding: getWidth(4),
    marginVertical: getHeight(10),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: getHeight(8),
    borderRadius: getRadius(8),
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    textAlign: "center",
  },
});

export default TopTab;
