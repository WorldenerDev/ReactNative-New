import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getVertiPadding,
  getWidth,
  getRadius,
} from "@utils/responsive";

const ProfileButton = ({ title, onPress, showChevron = true }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
      {showChevron && (
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.input,
    borderRadius: getRadius(8),
    paddingVertical: getVertiPadding(16),
    paddingHorizontal: getWidth(16),
    marginBottom: getVertiPadding(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    flex: 1,
  },
  chevronContainer: {
    marginLeft: getWidth(8),
  },
  chevron: {
    fontSize: getFontSize(18),
    color: colors.lightText,
    fontFamily: fonts.RobotoRegular,
  },
});

export default ProfileButton;
