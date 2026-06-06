import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { buttonRadius } from "@utils/theme";
import { getHeight, getWidth } from "@utils/responsive";

const AppButton = ({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  children,
  compact = false,
}) => {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";

  return (
    <TouchableOpacity
      style={[
        styles.base,
        compact && styles.compact,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children || (
        <Text
          style={[
            styles.text,
            compact && styles.compactText,
            isPrimary && styles.primaryText,
            isSecondary && styles.secondaryText,
            isGhost && styles.ghostText,
            textStyle,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={compact ? 0.75 : 0.85}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  base: {
    borderRadius: buttonRadius,
    paddingHorizontal: getWidth(8),
    paddingVertical: getHeight(6),
    alignItems: "center",
    justifyContent: "center",
    minHeight: getHeight(32),
  },
  compact: {
    paddingHorizontal: getWidth(5),
    paddingVertical: getHeight(6),
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  ghost: {
    backgroundColor: "transparent",
    minWidth: getWidth(32),
    minHeight: getHeight(32),
    paddingHorizontal: getWidth(4),
  },
  text: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    textAlign: "center",
  },
  compactText: {
    width: "100%",
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.black,
  },
  ghostText: {
    color: colors.black,
  },
});
