import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "@assets/colors";
import { getFontSize, getHeight, getWidth } from "@utils/responsive";

const RadioCheckbox = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default RadioCheckbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  radioOuter: {
    height: getHeight(20),
    width: getHeight(20),
    borderRadius: getHeight(10),
    borderWidth: 2,
    borderColor: colors.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    height: getHeight(10),
    width: getHeight(10),
    borderRadius: getHeight(5),
    backgroundColor: colors.primary,
  },
  label: {
    marginLeft: 10,
    fontSize: getFontSize(14),
    color: colors.black,
  },
});
