import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getHoriPadding,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const ButtonComp = ({
  title,
  onPress,
  disabled = true,
  containerStyle = {},
  textStyle = {},
}) => {
  const isDisabled = disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text
        style={[
          styles.buttonText,
          isDisabled && styles.textDisabled,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: getVertiPadding(14),
    paddingHorizontal: getHoriPadding(40),
    borderRadius: getRadius(30),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
  },
  textDisabled: {
    color: colors.white,
    opacity: 0.7,
  },
});

export default ButtonComp;
