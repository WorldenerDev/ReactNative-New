import colors from "@assets/colors";
import imagePath from "@assets/icons";
import {
  getHeight,
  getRadius,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SIDE_SLOT_WIDTH = getWidth(50);

const Header = ({
  showBack = true,
  title = "",
  rightIconImage = null,
  onRightIconPress = null,
  rightIconSize,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.sideSlot}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Image
              tintColor={colors.black}
              source={imagePath.BACK_ICON}
              style={styles.iconStyle}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={styles.sideSlot}>
        {rightIconImage ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconBtn}
            activeOpacity={0.7}
          >
            <Image
              source={rightIconImage}
              style={[
                styles.rightIconStyle,
                rightIconSize != null && {
                  width: getWidth(rightIconSize),
                  height: getHeight(rightIconSize),
                },
              ]}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingTop: getVertiPadding(16),
    paddingBottom: getVertiPadding(20),
  },
  sideSlot: {
    width: SIDE_SLOT_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
  },
  iconStyle: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
  },
  rightIconBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  rightIconStyle: {
    height: getHeight(25),
    width: getWidth(25),
    resizeMode: "contain",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: getHeight(18),
    fontWeight: "600",
    color: colors.black,
  },
});
