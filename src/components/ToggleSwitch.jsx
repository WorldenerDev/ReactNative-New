import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import colors from "@assets/colors";
import { getWidth, getHeight, getRadius } from "@utils/responsive";

const ToggleSwitch = ({ isEnabled, onToggle, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.toggleContainer,
        isEnabled && styles.toggleContainerActive,
        disabled && styles.toggleContainerDisabled,
      ]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[styles.toggleCircle, isEnabled && styles.toggleCircleActive]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    width: getWidth(50),
    height: getHeight(30),
    backgroundColor: colors.border,
    borderRadius: getRadius(15),
    padding: 2,
    justifyContent: "center",
  },
  toggleContainerActive: {
    backgroundColor: colors.secondary,
  },
  toggleContainerDisabled: {
    opacity: 0.5,
  },
  toggleCircle: {
    width: getWidth(26),
    height: getHeight(26),
    backgroundColor: colors.white,
    borderRadius: getRadius(13),
    alignSelf: "flex-start",
  },
  toggleCircleActive: {
    alignSelf: "flex-end",
  },
});

export default ToggleSwitch;
